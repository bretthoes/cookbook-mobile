import { describe, expect, it } from "vitest"
import { MEMBERSHIP_TIER, canAddRecipe, canSendInvite } from "./membershipTier"

describe("canAddRecipe / canSendInvite", () => {
  it("allow contributors and above, matching the API", () => {
    for (const check of [canAddRecipe, canSendInvite]) {
      expect(check(MEMBERSHIP_TIER.Viewer)).toBe(false)
      expect(check(MEMBERSHIP_TIER.Contributor)).toBe(true)
      expect(check(MEMBERSHIP_TIER.Admin)).toBe(true)
      expect(check(MEMBERSHIP_TIER.Owner)).toBe(true)
    }
  })

  it("deny when the tier is unknown", () => {
    expect(canAddRecipe(undefined)).toBe(false)
    expect(canSendInvite(undefined)).toBe(false)
  })
})
