import { describe, expect, it } from "vitest"
import {
  extractPlansFromOffering,
  type PaywallPlanPackage,
} from "@/services/subscription/revenueCatPlans"

function pkg(
  identifier: string,
  productId: string,
  priceString: string,
  packageType: string | number = "CUSTOM",
): PaywallPlanPackage {
  return {
    identifier,
    packageType,
    product: { identifier: productId, priceString },
  }
}

describe("extractPlansFromOffering", () => {
  it("prefers explicit monthly and annual packages", () => {
    const plans = extractPlansFromOffering({
      monthly: pkg("$rc_monthly", "monthly", "$9.99", "MONTHLY"),
      annual: pkg("$rc_annual", "yearly", "$96.00", "ANNUAL"),
      availablePackages: [],
    })
    expect(plans).toEqual([
      { packageIdentifier: "$rc_monthly", period: "monthly", priceString: "$9.99" },
      { packageIdentifier: "$rc_annual", period: "annual", priceString: "$96.00" },
    ])
  })

  it("deduplicates when the same package appears twice", () => {
    const monthly = pkg("$rc_monthly", "monthly", "$9.99", "MONTHLY")
    const plans = extractPlansFromOffering({
      monthly,
      annual: monthly,
      availablePackages: [monthly],
    })
    expect(plans).toHaveLength(1)
  })

  it("infers period from availablePackages when monthly/annual slots are empty", () => {
    const plans = extractPlansFromOffering({
      availablePackages: [
        pkg("custom_month", "pro-month-sub", "$4.99"),
        pkg("custom_year", "pro-year-sub", "$39.99"),
      ],
    })
    expect(plans.map((p) => p.period)).toEqual(["monthly", "annual"])
  })

  it("matches product id substrings and package types", () => {
    const plans = extractPlansFromOffering({
      availablePackages: [
        pkg("m1", "pro-month-sub", "$1.00", "CUSTOM"),
        pkg("y1", "pro-year-sub", "$10.00", "ANNUAL"),
      ],
    })
    expect(plans).toHaveLength(2)
    expect(plans[0]?.period).toBe("monthly")
    expect(plans[1]?.period).toBe("annual")
  })

  it("returns empty when no recognizable packages exist", () => {
    expect(
      extractPlansFromOffering({
        availablePackages: [pkg("other", "lifetime", "$99.00")],
      }),
    ).toEqual([])
  })
})
