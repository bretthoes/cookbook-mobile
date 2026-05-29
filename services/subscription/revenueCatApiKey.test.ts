import { describe, expect, it } from "vitest"
import { isValidRevenueCatApiKey } from "@/services/subscription/revenueCatApiKey"

describe("isValidRevenueCatApiKey", () => {
  it("accepts test, App Store, and Play prefixes", () => {
    expect(isValidRevenueCatApiKey("test_abc")).toBe(true)
    expect(isValidRevenueCatApiKey("appl_abc")).toBe(true)
    expect(isValidRevenueCatApiKey("goog_abc")).toBe(true)
  })

  it("rejects empty, unknown prefix, and partial keys", () => {
    expect(isValidRevenueCatApiKey("")).toBe(false)
    expect(isValidRevenueCatApiKey(null)).toBe(false)
    expect(isValidRevenueCatApiKey(undefined)).toBe(false)
    expect(isValidRevenueCatApiKey("sk_live_abc")).toBe(false)
    expect(isValidRevenueCatApiKey("test")).toBe(false)
  })
})
