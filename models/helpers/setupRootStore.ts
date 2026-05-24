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
import Config from "@/config"
import { setAccessToken } from "@/services/api/client"
import { applySnapshot, IDisposer, onSnapshot, reaction } from "mobx-state-tree"
import * as SecureStore from "expo-secure-store"
import * as storage from "../../utils/storage"
import { RootStore, RootStoreSnapshot } from "../RootStore"

/**
 * The key we'll be saving our state as within async storage.
 */
const ROOT_STATE_STORAGE_KEY = "root-v1"

/**
 * Decode the payload of a JWT without verifying the signature.
 * Used only to read the `sub` claim (user ID) for RevenueCat identification.
 */
function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")))
    return payload.sub ?? null
  } catch {
    return null
  }
}

/**
 * Initialize RevenueCat with the configured API key.
 * Safe to call multiple times; skipped when no key is configured.
 */
async function initRevenueCat(): Promise<void> {
  const apiKey = Config.REVENUECAT_API_KEY
  if (!apiKey) return
  try {
    const Purchases = (await import("react-native-purchases")).default
    Purchases.configure({ apiKey })
  } catch (e) {
    console.warn("RevenueCat init failed:", e)
  }
}

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

  if (accessToken && refreshToken) {
    setAccessToken(accessToken)
    rootStore.authenticationStore.setAuthToken(accessToken)
    return
  }

  setAccessToken(null)
  rootStore.authenticationStore.setAuthToken(undefined)
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

  await initRevenueCat()

  if (rootStore.authenticationStore.authToken) {
    const userId = getUserIdFromToken(rootStore.authenticationStore.authToken)
    if (userId) {
      await rootStore.subscriptionStore.hydrate(userId)
    }
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
        const userId = getUserIdFromToken(token)
        if (userId) rootStore.subscriptionStore.hydrate(userId)
      } else {
        rootStore.subscriptionStore.reset()
      }
    },
  )

  const unsubscribe = () => {
    _disposer?.()
    _disposer = undefined
    _subscriptionDisposer()
  }

  return { rootStore, restoredState, unsubscribe }
}

// @mst remove-file
