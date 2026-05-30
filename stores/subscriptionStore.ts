import {
  ensureRevenueCatReady,
  hasProEntitlement,
  logOutRevenueCat,
  PRO_ENTITLEMENT_ID,
} from "@/services/subscription/revenueCat"
import { create } from "zustand"

export { PRO_ENTITLEMENT_ID }

export interface SubscriptionState {
  isPro: boolean
  isLoading: boolean
  hydrate: (userId: string) => Promise<void>
  refresh: (userId: string) => Promise<void>
  reset: () => void
  setIsPro: (value: boolean) => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPro: false,
  isLoading: false,

  setIsPro: (value) => set({ isPro: value }),

  hydrate: async (userId) => {
    set({ isLoading: true })
    try {
      await ensureRevenueCatReady(userId)
      const Purchases = (await import("react-native-purchases")).default
      const customerInfo = await Purchases.getCustomerInfo()
      set({ isPro: hasProEntitlement(customerInfo) })
    } catch (e) {
      console.warn("subscriptionStore.hydrate error:", e)
    } finally {
      set({ isLoading: false })
    }
  },

  refresh: async (userId) => {
    try {
      await ensureRevenueCatReady(userId)
      const Purchases = (await import("react-native-purchases")).default
      const customerInfo = await Purchases.getCustomerInfo()
      set({ isPro: hasProEntitlement(customerInfo) })
    } catch (e) {
      console.warn("subscriptionStore.refresh error:", e)
    }
  },

  reset: () => {
    set({ isPro: false, isLoading: false })
    logOutRevenueCat().catch((e) => console.warn("subscriptionStore.reset logOut error:", e))
  },
}))
