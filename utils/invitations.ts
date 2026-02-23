import * as Linking from "expo-linking"

/** Create an invite URL for the given token */
export function toInviteUrl(token: string): string {
  return Linking.createURL(`/i/${token}`)
}

/**
 * Validate an invite email. Returns an error string or "" if valid.
 */
export function validateInviteEmail(email: string): string {
  if (email.length === 0) return "can't be blank"
  if (email.length < 6) return "must be at least 6 characters"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "must be a valid email address"
  return ""
}
