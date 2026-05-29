import { delay } from "@/utils/delay"

export const RECIPE_IMPORT_MIN_LOADING_MS = 1500
export const RECIPE_SOCIAL_IMPORT_MIN_LOADING_MS = 1500

export async function ensureMinimumElapsed(startTime: number, minimumMs: number): Promise<void> {
  const elapsed = Date.now() - startTime
  if (elapsed < minimumMs) {
    await delay(minimumMs - elapsed)
  }
}
