/**
 * App bootstrap: SecureStore auth sync, API callbacks, RevenueCat, legacy root-v1 migration.
 *
 * @refresh reset
 */
import { api } from "@/services/api"
import { setAccessToken } from "@/services/api/client"
import {
  ensureRevenueCatConfigured,
  setRevenueCatCustomerInfoHandler,
  hasProEntitlement,
  teardownRevenueCatListener,
} from "@/services/subscription/revenueCat"
import { resolveRevenueCatAppUserId } from "@/utils/resolveRevenueCatAppUserId"
import { useAuthStore } from "@/stores/authStore"
import { useSubscriptionStore } from "@/stores/subscriptionStore"
import { useUiStore, type LegacyUiSnapshot } from "@/stores/uiStore"
import * as SecureStore from "expo-secure-store"
import { load } from "@/utils/storage"

const LEGACY_ROOT_STATE_KEY = "root-v1"

type LegacyMstSnapshot = {
  cookbookStore?: {
    favorites?: (number | { id?: number })[]
    favoritesOnly?: boolean
    selected?: number | { id?: number }
  }
  recipeStore?: {
    drafts?: unknown[]
    recipeToAdd?: unknown
    weeklyImportCount?: number
    weeklyImportWeekStart?: string
  }
  authenticationStore?: {
    authEmail?: string
    displayName?: string
    userId?: string
  }
}

async function syncAuthFromSecureStore() {
  const accessToken = await SecureStore.getItemAsync("accessToken")
  const refreshToken = await SecureStore.getItemAsync("refreshToken")
  const storedEmail = await SecureStore.getItemAsync("email")
  const auth = useAuthStore.getState()

  if (accessToken && refreshToken) {
    setAccessToken(accessToken)
    auth.setAuthToken(accessToken)
    if (storedEmail) {
      if (!auth.authEmail) auth.setAuthEmail(storedEmail)
      if (!auth.userId) {
        useAuthStore.setState({ userId: storedEmail.trim().toLowerCase() })
      }
    }
    return
  }

  setAccessToken(null)
  auth.setAuthToken(undefined)
}

let authSubscriptionUnsubscribe: (() => void) | undefined

function subscribeAuthForSubscription() {
  authSubscriptionUnsubscribe?.()
  authSubscriptionUnsubscribe = useAuthStore.subscribe((state, prev) => {
    if (state.authToken === prev.authToken) return
    if (state.authToken) {
      void resolveRevenueCatAppUserId({
        storedUserId: state.userId,
        authEmail: state.authEmail,
      }).then((userId) => {
        if (userId) {
          useAuthStore.setState({ userId })
          void useSubscriptionStore.getState().hydrate(userId)
        }
      })
    } else {
      useSubscriptionStore.getState().reset()
    }
  })
}

export async function setupApp() {
  try {
    const legacy = load<LegacyMstSnapshot>(LEGACY_ROOT_STATE_KEY)
    if (legacy) {
      useUiStore.getState().migrateFromLegacySnapshot(legacy as LegacyUiSnapshot)
      if (legacy.authenticationStore?.authEmail && !useAuthStore.getState().authEmail) {
        useAuthStore.setState({
          authEmail: legacy.authenticationStore.authEmail,
          displayName: legacy.authenticationStore.displayName ?? "",
          userId: legacy.authenticationStore.userId,
        })
      }
    }
  } catch (e) {
    if (__DEV__ && e instanceof Error) console.error(e.message)
  }

  await syncAuthFromSecureStore()

  setRevenueCatCustomerInfoHandler((customerInfo) => {
    useSubscriptionStore.getState().setIsPro(hasProEntitlement(customerInfo))
  })

  await ensureRevenueCatConfigured()

  const auth = useAuthStore.getState()
  const appUserId = await resolveRevenueCatAppUserId({
    storedUserId: auth.userId,
    authEmail: auth.authEmail,
  })
  if (appUserId) {
    if (!auth.userId) useAuthStore.setState({ userId: appUserId })
    await useSubscriptionStore.getState().hydrate(appUserId)
  }

  api.setSessionExpiredCallback(() => {
    void useAuthStore.getState().logout()
  })

  api.setOnAccessTokenRefreshed((accessToken) => {
    useAuthStore.getState().setAuthToken(accessToken)
  })

  subscribeAuthForSubscription()

  return () => {
    authSubscriptionUnsubscribe?.()
    authSubscriptionUnsubscribe = undefined
    teardownRevenueCatListener()
  }
}
