/**
 * Custom fetch implementation that adds configurable timeout via AbortController.
 * Used by the openapi-fetch client to replicate apisauce's timeout behavior.
 *
 * - On success: returns native Response
 * - On timeout: throws DOMException (AbortError) - middleware maps to GeneralApiProblem timeout
 * - On network error: throws TypeError - middleware maps to GeneralApiProblem cannot-connect
 */

const DEFAULT_TIMEOUT_MS = 10000

export type FetchWithTimeout = (
  input: RequestInfo | URL,
  init?: RequestInit & { timeout?: number },
) => Promise<Response>

/**
 * Creates a fetch function with timeout support.
 * @param defaultTimeoutMs - Default timeout in milliseconds (default: 10000)
 * @returns A fetch-compatible function
 */
export function createFetchWithTimeout(defaultTimeoutMs = DEFAULT_TIMEOUT_MS): FetchWithTimeout {
  return async function fetchWithTimeout(
    input: RequestInfo | URL,
    init?: RequestInit & { timeout?: number },
  ): Promise<Response> {
    const timeoutMs = init?.timeout ?? defaultTimeoutMs
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(input, {
        ...init,
        signal: init?.signal ?? controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }
}

export const fetchWithTimeout = createFetchWithTimeout()
