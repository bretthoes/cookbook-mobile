import { describe, expect, it } from "vitest"
import { hasChosenDisplayName } from "@/utils/displayName"

describe("hasChosenDisplayName", () => {
  it("is true for a real name", () => {
    expect(hasChosenDisplayName("Brett", "brett@example.com")).toBe(true)
  })

  it("is false when the server fell back to the email", () => {
    expect(hasChosenDisplayName("Brett@Example.com", "brett@example.com")).toBe(false)
  })

  it("is false for a blank name", () => {
    expect(hasChosenDisplayName("  ", "brett@example.com")).toBe(false)
  })
})
