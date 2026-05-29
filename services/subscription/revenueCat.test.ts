import { describe, expect, it } from "vitest"
import {
  hasProEntitlement,
  isUserCancelledPurchase,
  PRO_ENTITLEMENT_ID,
  type EntitlementCustomerInfo,
} from "@/services/subscription/entitlements"

function customerInfoWithEntitlements(active: string[]): EntitlementCustomerInfo {
  const entitlements = Object.fromEntries(active.map((id) => [id, { identifier: id }]))
  return { entitlements: { active: entitlements } }
}

describe("hasProEntitlement", () => {
  it("uses the pro entitlement id", () => {
    expect(PRO_ENTITLEMENT_ID).toBe("pro")
  })

  it("returns true when pro is active", () => {
    expect(hasProEntitlement(customerInfoWithEntitlements(["pro"]))).toBe(true)
  })

  it("returns false when pro is missing", () => {
    expect(hasProEntitlement(customerInfoWithEntitlements([]))).toBe(false)
    expect(hasProEntitlement(customerInfoWithEntitlements(["other"]))).toBe(false)
  })
})

describe("isUserCancelledPurchase", () => {
  it("returns true when userCancelled is set", () => {
    expect(isUserCancelledPurchase({ userCancelled: true })).toBe(true)
  })

  it("returns false otherwise", () => {
    expect(isUserCancelledPurchase({ userCancelled: false })).toBe(false)
    expect(isUserCancelledPurchase(new Error("failed"))).toBe(false)
    expect(isUserCancelledPurchase(null)).toBe(false)
  })
})
