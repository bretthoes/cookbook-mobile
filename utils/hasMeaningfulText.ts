/** True when a string has visible content after normalizing nbsp and trimming. */
export function hasMeaningfulText(value?: string | null): boolean {
  if (value == null) return false
  return value.replace(/\u00A0/g, " ").trim().length > 0
}
