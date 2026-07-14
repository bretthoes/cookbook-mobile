/** Expo Router may return string | string[] for a param — normalize to a single string. */
export function normalizeRouteParam(value: string | string[] | undefined): string | undefined {
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}
