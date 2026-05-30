import { describe, expect, it } from "vitest"
import { computeAnnualSavingsPercent, parsePriceAmount } from "@/utils/subscription/pricing"

describe("parsePriceAmount", () => {
  it("parses USD-style prices", () => {
    expect(parsePriceAmount("$9.99")).toBe(9.99)
    expect(parsePriceAmount("€12,50")).toBe(12.5)
    expect(parsePriceAmount("12.99 USD")).toBe(12.99)
  })

  it("returns null for unparseable strings", () => {
    expect(parsePriceAmount("free")).toBeNull()
    expect(parsePriceAmount("")).toBeNull()
    expect(parsePriceAmount("—")).toBeNull()
  })
})

describe("computeAnnualSavingsPercent", () => {
  it("computes rounded savings vs monthly annualized", () => {
    expect(computeAnnualSavingsPercent("$10.00", "$96.00")).toBe(20)
  })

  it("returns undefined when prices cannot be parsed", () => {
    expect(computeAnnualSavingsPercent("n/a", "$96.00")).toBeUndefined()
  })

  it("returns undefined when monthly annualized is zero", () => {
    expect(computeAnnualSavingsPercent("$0.00", "$10.00")).toBeUndefined()
  })

  it("returns 0 when annual equals monthly annualized", () => {
    expect(computeAnnualSavingsPercent("$10.00", "$120.00")).toBe(0)
  })

  it("rounds savings to the nearest percent", () => {
    expect(computeAnnualSavingsPercent("$9.99", "$95.90")).toBe(20)
  })
})
