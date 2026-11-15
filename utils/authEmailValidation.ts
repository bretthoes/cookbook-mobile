import type { TxKeyPath } from "@/i18n"

/**
 * The server uses the email as the Identity user name, which only allows ASCII letters, digits,
 * and the RFC 5322 local-part symbols. Matching that here keeps the server from rejecting an
 * address the form accepted.
 */
const EMAIL_PATTERN = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/

export function getAuthEmailValidationTxKey(authEmail: string): TxKeyPath | undefined {
  if (authEmail.length === 0) return "registerScreen:validation.cantBeBlank"
  if (authEmail.length < 6) return "registerScreen:validation.minLength"
  if (authEmail.length > 99) return "registerScreen:validation.emailTooLong"
  if (!EMAIL_PATTERN.test(authEmail)) return "registerScreen:validation.emailInvalid"
  return undefined
}
