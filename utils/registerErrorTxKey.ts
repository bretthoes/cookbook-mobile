import type { TxKeyPath } from "@/i18n"
import type { RegisterResult } from "@/services/api/wrappers/users"

const DUPLICATE_CODES = new Set(["DuplicateUserName", "DuplicateEmail"])
const INVALID_EMAIL_CODES = new Set(["InvalidEmail", "InvalidUserName"])

/** Maps a failed registration to the message shown under the password field. */
export function getRegisterErrorTxKey(result: Exclude<RegisterResult, { kind: "ok" }>): TxKeyPath {
  switch (result.kind) {
    case "validation":
      if (result.codes.some((code) => DUPLICATE_CODES.has(code)))
        return "registerScreen:errors.emailRegistered"
      if (result.codes.some((code) => INVALID_EMAIL_CODES.has(code)))
        return "registerScreen:errors.invalidEmail"
      if (result.codes.some((code) => code.startsWith("Password")))
        return "registerScreen:errors.passwordRejected"
      return "registerScreen:errors.generic"
    case "rate-limited":
      return "errors:tooManyAttempts"
    case "timeout":
      return "errors:timeout"
    case "cannot-connect":
      return "errors:cannotConnect"
    default:
      return "registerScreen:errors.generic"
  }
}
