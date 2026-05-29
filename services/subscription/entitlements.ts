/** RevenueCat entitlement identifier (dashboard slug). */
export const PRO_ENTITLEMENT_ID = "pro"

export type EntitlementCustomerInfo = {
  entitlements: { active: Record<string, unknown> }
}

export function hasProEntitlement(customerInfo: EntitlementCustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
}

export function isUserCancelledPurchase(error: unknown): boolean {
  return (error as { userCancelled?: boolean })?.userCancelled === true
}
