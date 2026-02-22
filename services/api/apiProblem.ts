export type GeneralApiProblem =
  /**
   * Times up.
   */
  | { kind: "timeout"; temporary: true }
  /**
   * Cannot connect to the server for some reason.
   */
  | { kind: "cannot-connect"; temporary: true }
  /**
   * The server experienced a problem. Any 5xx error.
   */
  | { kind: "server" }
  /**
   * We're not allowed because we haven't identified ourself. This is 401.
   */
  | { kind: "unauthorized" }
  /**
   * This is a custom case for when an user account is created but unable to login because the
   * account has yet to be confirmed. This will still be sent as a 401 and so needs a distinct
   * kind, as this represents two separate paths in the login flow.
   */
  | { kind: "notallowed" }
  /**
   * We don't have access to perform that request. This is 403.
   */
  | { kind: "forbidden" }
  /**
   * Unable to find that resource.  This is a 404.
   */
  | { kind: "not-found" }
  /**
   * Our request conflicted with an existing resource. This is a 409.
   */
  | { kind: "conflict"; detail?: string }
  /**
   * All other 4xx series errors.
   */
  | { kind: "rejected" }
  /**
   * Something truly unexpected happened. Most likely can try again. This is a catch all.
   */
  | { kind: "unknown"; temporary: true }
  /**
   * The data we received is not in the expected format.
   */
  | { kind: "bad-data" }

/**
 * Maps a fetch Response (and optionally pre-parsed body) to GeneralApiProblem.
 * Used by the openapi-fetch client wrapper when response is not OK.
 *
 * @param response - The fetch Response
 * @param data - Optional pre-parsed JSON body (e.g. from openapi-fetch)
 */
export function getGeneralApiProblemFromResponse(
  response: Response,
  data?: { detail?: string } | null,
): GeneralApiProblem | null {
  if (response.ok) return null

  if (response.status >= 500) return { kind: "server" }

  if (response.status >= 400) {
    switch (response.status) {
      case 401:
        if ((data?.detail ?? "").toLowerCase() === "notallowed") return { kind: "notallowed" }
        return { kind: "unauthorized" }
      case 403:
        return { kind: "forbidden" }
      case 404:
        return { kind: "not-found" }
      case 409:
        return { kind: "conflict", detail: data?.detail }
      default:
        return { kind: "rejected" }
    }
  }

  return null
}

/**
 * Maps fetch/network errors (AbortError, TypeError) to GeneralApiProblem.
 */
export function getGeneralApiProblemFromError(error: unknown): GeneralApiProblem | null {
  if (error instanceof Error) {
    if (error.name === "AbortError") return { kind: "timeout", temporary: true }
    if (error instanceof TypeError) return { kind: "cannot-connect", temporary: true }
  }
  return { kind: "unknown", temporary: true }
}
