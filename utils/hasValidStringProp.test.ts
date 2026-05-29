import { describe, expect, it } from "vitest"
import { hasValidStringProp } from "@/utils/hasValidStringProp"

describe("hasValidStringProp", () => {
  it("returns true when prop exists and is a string", () => {
    expect(hasValidStringProp({ title: "Soup" }, "title")).toBe(true)
    expect(hasValidStringProp({ title: "" }, "title")).toBe(true)
  })

  it("returns false for null, non-objects, missing keys, or non-string values", () => {
    expect(hasValidStringProp(null, "title")).toBe(false)
    expect(hasValidStringProp("text", "title")).toBe(false)
    expect(hasValidStringProp({}, "title")).toBe(false)
    expect(hasValidStringProp({ title: 42 }, "title")).toBe(false)
    expect(hasValidStringProp({ title: undefined }, "title")).toBe(false)
  })
})
