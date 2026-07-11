import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  buildDraftFieldsFromFormData,
  draftItemHasContent,
  getCurrentWeekKey,
  hasDraftContent,
  type DraftFormData,
} from "@/utils/recipeDraftHelpers"

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
        ingredientSections: [{ title: "", ingredients: [{ name: "salt", optional: false }] }],
      }),
    ).toBe(true)
  })

  it("detects direction image without text", () => {
    const base = emptyDraft()
    expect(
      hasDraftContent({ ...base, directions: [{ text: "", image: "uploads/step1.jpg" }] }),
    ).toBe(true)
  })

  it("ignores whitespace-only fields", () => {
    const base = emptyDraft()
    expect(hasDraftContent({ ...base, title: "   " })).toBe(false)
    expect(
      hasDraftContent({
        ...base,
        ingredientSections: [{ title: "", ingredients: [{ name: "  ", optional: false }] }],
      }),
    ).toBe(false)
  })

  it("ignores tags and times alone", () => {
    const base = emptyDraft()
    expect(hasDraftContent({ ...base, isVegetarian: true, servings: 4 })).toBe(false)
  })

  it("ignores section title without ingredients", () => {
    const base = emptyDraft()
    expect(
      hasDraftContent({
        ...base,
        ingredientSections: [{ title: "For the sauce", ingredients: [{ name: "", optional: false }] }],
      }),
    ).toBe(false)
  })
})

describe("draftItemHasContent", () => {
  it("matches hasDraftContent for normalized draft shape", () => {
    const fields = buildDraftFieldsFromFormData({
      ...emptyDraft(),
      title: "Pasta",
      directions: [{ text: "boil", image: null }],
    })
    expect(draftItemHasContent(fields)).toBe(true)
    expect(hasDraftContent({ ...emptyDraft(), title: "Pasta", directions: [{ text: "boil", image: null }] })).toBe(
      true,
    )
  })

  it("detects direction image on persisted draft", () => {
    const fields = buildDraftFieldsFromFormData({
      ...emptyDraft(),
      directions: [{ text: "", image: "uploads/step1.jpg" }],
    })
    expect(draftItemHasContent(fields)).toBe(true)
    expect(fields.directions).toHaveLength(1)
    expect(fields.directions[0]?.image).toBe("uploads/step1.jpg")
  })
})

describe("buildDraftFieldsFromFormData", () => {
  it("preserves direction steps that only have an image", () => {
    const fields = buildDraftFieldsFromFormData({
      ...emptyDraft(),
      directions: [{ text: "", image: "uploads/step1.jpg" }],
    })
    expect(fields.directions).toEqual([
      { id: 0, text: "", ordinal: 1, image: "uploads/step1.jpg" },
    ])
    expect(draftItemHasContent(fields)).toBe(true)
  })

  it("produces empty content when only tags or times are set", () => {
    const fields = buildDraftFieldsFromFormData({
      ...emptyDraft(),
      isVegan: true,
      preparationTimeInMinutes: 30,
    })
    expect(draftItemHasContent(fields)).toBe(false)
  })

  it("strips whitespace-only title but keeps real content", () => {
    const emptyFields = buildDraftFieldsFromFormData({ ...emptyDraft(), title: "   " })
    expect(draftItemHasContent(emptyFields)).toBe(false)

    const contentFields = buildDraftFieldsFromFormData({ ...emptyDraft(), title: "  Soup  " })
    expect(draftItemHasContent(contentFields)).toBe(true)
    expect(contentFields.title).toBe("  Soup  ")
  })
})
