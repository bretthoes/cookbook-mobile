import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getCurrentWeekKey,
  hasDraftContent,
  type DraftFormData,
} from "@/models/Recipe/recipeDraftHelpers"

const emptyDraft = (): DraftFormData => ({
  title: "",
  summary: null,
  preparationTimeInMinutes: null,
  cookingTimeInMinutes: null,
  bakingTimeInMinutes: null,
  servings: null,
  ingredientSections: [{ title: "", ingredients: [{ name: "", optional: false }] }],
  directions: [{ text: "", image: null }],
  images: [],
})

describe("getCurrentWeekKey", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns ISO date for Monday of the current week (Wednesday)", () => {
    vi.setSystemTime(new Date("2026-05-27T12:00:00Z")) // Wednesday
    expect(getCurrentWeekKey()).toBe("2026-05-25")
  })

  it("returns prior Monday when today is Sunday", () => {
    vi.setSystemTime(new Date("2026-05-31T12:00:00Z")) // Sunday
    expect(getCurrentWeekKey()).toBe("2026-05-25")
  })

  it("returns same day when today is Monday", () => {
    vi.setSystemTime(new Date("2026-05-25T08:00:00Z"))
    expect(getCurrentWeekKey()).toBe("2026-05-25")
  })
})

describe("hasDraftContent", () => {
  it("is false for empty draft", () => {
    expect(hasDraftContent(emptyDraft())).toBe(false)
  })

  it("detects title, summary, images, directions, and ingredients", () => {
    const base = emptyDraft()
    expect(hasDraftContent({ ...base, title: "  Soup " })).toBe(true)
    expect(hasDraftContent({ ...base, summary: "notes" })).toBe(true)
    expect(hasDraftContent({ ...base, images: ["key.jpg"] })).toBe(true)
    expect(hasDraftContent({ ...base, directions: [{ text: "boil", image: null }] })).toBe(true)
    expect(
      hasDraftContent({
        ...base,
        ingredientSections: [
          { title: "", ingredients: [{ name: "salt", optional: false }] },
        ],
      }),
    ).toBe(true)
  })

  it("ignores whitespace-only fields", () => {
    const base = emptyDraft()
    expect(hasDraftContent({ ...base, title: "   " })).toBe(false)
    expect(
      hasDraftContent({
        ...base,
        ingredientSections: [
          { title: "", ingredients: [{ name: "  ", optional: false }] },
        ],
      }),
    ).toBe(false)
  })
})
