/**
 * `GET /api/Users/display-name` falls back to the account email when no name has been set.
 * Display names cannot contain "@", so a match means the user never chose one.
 */
export function hasChosenDisplayName(displayName: string, email: string): boolean {
  const name = displayName.trim()
  if (!name) return false
  return name.toLowerCase() !== email.trim().toLowerCase()
}
