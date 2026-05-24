import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "@/models/helpers/withSetPropAction"

/**
 * The RevenueCat entitlement identifier configured in the RevenueCat dashboard.
 * Update this if you use a different entitlement name.
 */
export const PRO_ENTITLEMENT_ID = "pro"

export const SubscriptionStoreModel = types
  .model("SubscriptionStore")
  .props({
    isPro: types.optional(types.boolean, false),
    isLoading: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    /**
     * Identifies the user in RevenueCat and fetches their current entitlements.
     * Call this after login with the server-issued user ID so RevenueCat can
     * correlate purchases with the user across devices.
     *
     * @param userId - The ASP.NET Identity user ID (the `sub` JWT claim).
     */
    hydrate: flow(function* (userId: string) {
      self.isLoading = true
      try {
        const Purchases = (yield import("react-native-purchases")).default
        yield Purchases.logIn(userId)
        const customerInfo = yield Purchases.getCustomerInfo()
        self.isPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
      } catch (e) {
        console.warn("SubscriptionStore.hydrate error:", e)
      } finally {
        self.isLoading = false
      }
    }),

    /**
     * Refreshes entitlement status from RevenueCat without changing the logged-in user.
     * Call this when returning from the paywall or after a purchase.
     */
    refresh: flow(function* () {
      try {
        const Purchases = (yield import("react-native-purchases")).default
        const customerInfo = yield Purchases.getCustomerInfo()
        self.isPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
      } catch (e) {
        console.warn("SubscriptionStore.refresh error:", e)
      }
    }),

    /** Call on logout to reset subscription state. */
    reset() {
      self.isPro = false
      self.isLoading = false
      import("react-native-purchases")
        .then(({ default: Purchases }) => Purchases.logOut())
        .catch((e) => console.warn("SubscriptionStore.reset logOut error:", e))
    },
  }))

export interface SubscriptionStore extends Instance<typeof SubscriptionStoreModel> {}
export interface SubscriptionStoreSnapshot extends SnapshotOut<typeof SubscriptionStoreModel> {}
