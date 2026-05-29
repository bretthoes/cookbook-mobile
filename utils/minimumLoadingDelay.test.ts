import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  ensureMinimumElapsed,
  RECIPE_IMPORT_MIN_LOADING_MS,
  RECIPE_SOCIAL_IMPORT_MIN_LOADING_MS,
} from "@/utils/minimumLoadingDelay"

describe("minimumLoadingDelay constants", () => {
  it("uses 1500ms for import flows", () => {
    expect(RECIPE_IMPORT_MIN_LOADING_MS).toBe(1500)
    expect(RECIPE_SOCIAL_IMPORT_MIN_LOADING_MS).toBe(1500)
  })
})

describe("ensureMinimumElapsed", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("waits for the remaining minimum time", async () => {
    const startTime = Date.now()
    vi.advanceTimersByTime(400)
    const promise = ensureMinimumElapsed(startTime, 1000)
    await vi.advanceTimersByTimeAsync(600)
    await promise
  })

  it("does not wait when minimum already elapsed", async () => {
    const startTime = Date.now() - 2000
    const promise = ensureMinimumElapsed(startTime, 1000)
    await promise
    expect(vi.getTimerCount()).toBe(0)
  })
})
