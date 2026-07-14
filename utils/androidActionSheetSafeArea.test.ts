import { describe, expect, it } from "vitest"
import { androidActionSheetContainerStyle } from "./androidActionSheetSafeArea"

describe("androidActionSheetContainerStyle", () => {
  it("returns existing style unchanged when bottom inset is 0", () => {
    const existing = { backgroundColor: "white" }
    expect(androidActionSheetContainerStyle(0, existing)).toBe(existing)
    expect(androidActionSheetContainerStyle(0)).toBeUndefined()
  })

  it("adds paddingBottom for a positive bottom inset", () => {
    expect(androidActionSheetContainerStyle(48)).toEqual({ paddingBottom: 48 })
  })

  it("merges with existing containerStyle and preserves other props", () => {
    expect(
      androidActionSheetContainerStyle(24, {
        backgroundColor: "black",
        paddingBottom: 8,
      }),
    ).toEqual({
      backgroundColor: "black",
      paddingBottom: 32,
    })
  })

  it("treats non-number paddingBottom as 0 when merging", () => {
    expect(
      androidActionSheetContainerStyle(16, {
        paddingBottom: "10%" as unknown as number,
      }),
    ).toEqual({
      paddingBottom: 16,
    })
  })
})
