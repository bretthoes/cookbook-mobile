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
import { applySnapshot, IDisposer, onSnapshot } from "mobx-state-tree"
import * as SecureStore from "expo-secure-store"
import * as storage from "../../utils/storage"
import { RootStore, RootStoreSnapshot } from "../RootStore"

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

  // stop tracking state changes if we've already setup
  if (_disposer) _disposer()

  // track changes & save to AsyncStorage (tokens excluded — see snapshotForPersistence)
  _disposer = onSnapshot(rootStore, (snapshot) =>
    storage.save(ROOT_STATE_STORAGE_KEY, snapshotForPersistence(snapshot)),
  )

  // Wire up the API's session expired callback to logout
  api.setSessionExpiredCallback(() => {
    rootStore.authenticationStore.logout()
  })

  api.setOnAccessTokenRefreshed((accessToken) => {
    rootStore.authenticationStore.setAuthToken(accessToken)
  })

  const unsubscribe = () => {
    _disposer?.()
    _disposer = undefined
  }

  return { rootStore, restoredState, unsubscribe }
}

// @mst remove-file
