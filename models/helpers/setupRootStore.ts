/**
 * This file is where we do "rehydration" of your RootStore from AsyncStorage.
 * This lets you persist your state between app launches.
 *
 * Navigation state persistence is handled in navigationUtilities.tsx.
 *
 * Note that Fast Refresh doesn't play well with this file, so if you edit this,
 * do a full refresh of your app instead.
 *
 * @refresh reset
 */
import { api } from "@/services/api"
import { setAccessToken } from "@/services/api/client"
import { reaction } from "mobx"
import { applySnapshot, IDisposer, onSnapshot } from "mobx-state-tree"
import * as SecureStore from "expo-secure-store"
import * as storage from "../../utils/storage"
import { RootStore, RootStoreSnapshot } from "../RootStore"
import {
  ensureRevenueCatConfigured,
  teardownRevenueCatListener,
  setRevenueCatCustomerInfoHandler,
  hasProEntitlement,
} from "@/services/subscription/revenueCat"
import { resolveRevenueCatAppUserId } from "@/utils/resolveRevenueCatAppUserId"

/**
 * The key we'll be saving our state as within async storage.
 */
const ROOT_STATE_STORAGE_KEY = "root-v1"

/**
 * Auth tokens live in SecureStore only — do not persist them in the MST AsyncStorage snapshot.
 */
function snapshotForPersistence(snapshot: RootStoreSnapshot): RootStoreSnapshot {
  if (!snapshot.authenticationStore) return snapshot
  const { authToken: _authToken, authResult: _authResult, ...authenticationStore } =
    snapshot.authenticationStore
  return {
    ...snapshot,
    authenticationStore: {
      ...authenticationStore,
      authToken: undefined,
      authResult: undefined,
    },
  }
}

/**
 * Align MST auth state with SecureStore (source of truth for API tokens).
 */
async function syncAuthFromSecureStore(rootStore: RootStore) {
  const accessToken = await SecureStore.getItemAsync("accessToken")
  const refreshToken = await SecureStore.getItemAsync("refreshToken")

  const storedEmail = await SecureStore.getItemAsync("email")

  if (accessToken && refreshToken) {
    setAccessToken(accessToken)
    rootStore.authenticationStore.setAuthToken(accessToken)
    if (storedEmail) {
      if (!rootStore.authenticationStore.authEmail) {
        rootStore.authenticationStore.setProp("authEmail", storedEmail)
      }
      if (!rootStore.authenticationStore.userId) {
        rootStore.authenticationStore.setProp("userId", storedEmail.trim().toLowerCase())
      }
    }
    return
  }

  setAccessToken(null)
  rootStore.authenticationStore.setAuthToken(undefined)
  rootStore.authenticationStore.setProp("userId", undefined)
  rootStore.authenticationStore.setProp("authResult", undefined)
}

/**
 * Setup the root state.
 */
let _disposer: IDisposer | undefined
export async function setupRootStore(rootStore: RootStore) {
  let restoredState: RootStoreSnapshot | undefined | null

  try {
    // load the last known state from AsyncStorage
    restoredState = ((await storage.load(ROOT_STATE_STORAGE_KEY)) ?? {}) as RootStoreSnapshot
    applySnapshot(rootStore, restoredState)
  } catch (e) {
    // if there's any problems loading, then inform the dev what happened
    if (__DEV__) {
      if (e instanceof Error) console.error(e.message)
    }
  }

  await syncAuthFromSecureStore(rootStore)

  setRevenueCatCustomerInfoHandler((customerInfo) => {
    rootStore.subscriptionStore.setProp("isPro", hasProEntitlement(customerInfo))
  })

  await ensureRevenueCatConfigured()

  const appUserId = await resolveRevenueCatAppUserId({
    storedUserId: rootStore.authenticationStore.userId,
    authEmail: rootStore.authenticationStore.authEmail,
  })
  if (appUserId) {
    if (!rootStore.authenticationStore.userId) {
      rootStore.authenticationStore.setProp("userId", appUserId)
    }
    await rootStore.subscriptionStore.hydrate(appUserId)
  }

  // stop tracking state changes if we've already setup
  if (_disposer) _disposer()

  // track changes & save to AsyncStorage (tokens excluded — see snapshotForPersistence)
  _disposer = onSnapshot(rootStore, (snapshot) =>
    storage.save(ROOT_STATE_STORAGE_KEY, snapshotForPersistence(snapshot)),
  )

  // Wire up the API's session expired callback to logout
  api.setSessionExpiredCallback(() => {
    rootStore.authenticationStore.logout()
    rootStore.subscriptionStore.reset()
  })

  api.setOnAccessTokenRefreshed((accessToken) => {
    rootStore.authenticationStore.setAuthToken(accessToken)
  })

  // When the user logs in after the store is set up, hydrate subscription state.
  const _subscriptionDisposer = reaction(
    () => rootStore.authenticationStore.authToken,
    (token) => {
      if (token) {
        void resolveRevenueCatAppUserId({
          storedUserId: rootStore.authenticationStore.userId,
          authEmail: rootStore.authenticationStore.authEmail,
        }).then((userId) => {
          if (userId) {
            rootStore.authenticationStore.setProp("userId", userId)
            rootStore.subscriptionStore.hydrate(userId)
          }
        })
      } else {
        rootStore.subscriptionStore.reset()
      }
    },
  )

  const unsubscribe = () => {
    _disposer?.()
    _disposer = undefined
    _subscriptionDisposer()
    teardownRevenueCatListener()
  }

  return { rootStore, restoredState, unsubscribe }
}

// @mst remove-file
