/**
 * Helpers to map openapi-fetch responses to our { kind: "ok" } | GeneralApiProblem pattern.
 */
import {
  GeneralApiProblem,
  getGeneralApiProblemFromError,
  getGeneralApiProblemFromResponse,
} from "@/services/api/apiProblem"

export type ApiResult<T> = ({ kind: "ok" } & T) | GeneralApiProblem

/**
 * Maps an openapi-fetch result to our ApiResult format.
 * Use when the client call succeeded (response.ok) and we have data.
 */
export function toOkResult<T extends Record<string, unknown>>(data: T): ApiResult<T> {
  return { kind: "ok", ...data }
}

/**
 * Maps a non-OK fetch Response (and optional error body) to GeneralApiProblem.
 */
export function toProblemFromResponse(
  response: Response,
  errorBody?: { detail?: string } | null,
): GeneralApiProblem {
  const problem = getGeneralApiProblemFromResponse(response, errorBody)
  return problem ?? { kind: "rejected" }
}

/**
 * Maps a thrown error (AbortError, TypeError, etc.) to GeneralApiProblem.
 */
export function toProblemFromError(error: unknown): GeneralApiProblem {
  const problem = getGeneralApiProblemFromError(error)
  return problem ?? { kind: "unknown", temporary: true }
}
