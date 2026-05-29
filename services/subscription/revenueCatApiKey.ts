/** Prefixes accepted by RevenueCat dashboard keys (test / App Store / Play). */
export const REVENUECAT_API_KEY_PREFIX = /^(?:test_|appl_|goog_)/

export function isValidRevenueCatApiKey(key: string | undefined | null): boolean {
  if (!key) return false
  return REVENUECAT_API_KEY_PREFIX.test(key)
}
