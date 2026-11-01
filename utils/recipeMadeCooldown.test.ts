import { describe, expect, it, vi } from "vitest"
import { getRecipeMadeHoursAgo, RECIPE_MADE_COOLDOWN_MS } from "@/utils/recipeMadeCooldown"

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}))

const HOUR_MS = 60 * 60 * 1000

describe("getRecipeMadeHoursAgo", () => {
  it("returns 0 during the first hour", () => {
    const now = 1_700_000_000_000
    const endsAt = now - 30 * 60 * 1000 + RECIPE_MADE_COOLDOWN_MS
    expect(getRecipeMadeHoursAgo(endsAt, now)).toBe(0)
  })

  it("returns whole hours since the recipe was recorded", () => {
    const now = 1_700_000_000_000
    const endsAt = now - 3 * HOUR_MS + RECIPE_MADE_COOLDOWN_MS
    expect(getRecipeMadeHoursAgo(endsAt, now)).toBe(3)
  })
})
