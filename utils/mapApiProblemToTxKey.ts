import type { GeneralApiProblem } from "@/services/api/apiProblem"
import type { TxKeyPath } from "@/i18n"

/**
 * Maps API problems to user-facing i18n keys for consistent error UX.
 */
export function mapApiProblemToTxKey(problem: GeneralApiProblem): TxKeyPath {
  switch (problem.kind) {
    case "timeout":
      return "errors:timeout"
    case "cannot-connect":
      return "errors:cannotConnect"
    case "server":
      return "errors:server"
    case "unauthorized":
      return "errors:unauthorized"
    case "notallowed":
      return "errors:notAllowed"
    case "forbidden":
      return "errors:forbidden"
    case "not-found":
      return "errors:notFound"
    case "conflict":
      return "errors:conflict"
    case "rate-limited":
      return "errors:rateLimited"
    case "rejected":
      return "errors:rejected"
    case "bad-data":
      return "errors:badData"
    case "unknown":
    default:
      return "errors:unknown"
  }
}
