/**
 * OpenAPI-fetch client with auth middleware, token refresh, and session expiry handling.
 */
import Config from "@/config"
import { createFetchWithTimeout } from "@/services/api/fetchWithTimeout"
import type { paths } from "@/services/api/generated/schema"
import type { ApiConfig } from "@/services/api/types"
import createClient from "openapi-fetch"
import * as SecureStore from "expo-secure-store"

/** Paths that do not require Authorization header */
const UNPROTECTED_PATHS = [
  "/api/Users/login",
  "/api/Users/register",
  "/api/Users/resendConfirmationEmail",
  "/api/Users/forgotPassword",
  "/api/Users/resetPassword",
  "/api/Users/confirmEmail",
]

const DEFAULT_TIMEOUT_MS = 10000

/**
 * Derives server base URL from Config.API_URL.
 * Config.API_URL = "http://10.0.2.2:5000/api" -> baseUrl = "http://10.0.2.2:5000"
 */
function getBaseUrl(apiUrl: string): string {
  return apiUrl.replace(/\/api\/?$/, "")
}

/**
 * Creates the API client with auth middleware.
 */
export function createApiClient(
  config: ApiConfig = { url: Config.API_URL, timeout: DEFAULT_TIMEOUT_MS },
) {
  const baseUrl = getBaseUrl(config.url)
  const fetchWithTimeout = createFetchWithTimeout(config.timeout)

  let onSessionExpired: (() => void) | undefined

  async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url
    const isUnprotected = UNPROTECTED_PATHS.some((p) => url.includes(p))

    const existingHeaders =
      init?.headers ?? (input instanceof Request ? (input as Request).headers : undefined)
    const headers = new Headers(existingHeaders)
    if (!isUnprotected) {
      const accessToken = await SecureStore.getItemAsync("accessToken")
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`)
      }
    }
    headers.set("Accept", "application/json")

    const requestInit: RequestInit = { ...init, headers }

    let response = await fetchWithTimeout(input, requestInit)

    if (response.status === 401 && !url.includes("/Users/refresh")) {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")
      if (!refreshToken) {
        onSessionExpired?.()
        return response
      }

      const refreshResponse = await fetchWithTimeout(`${baseUrl}/api/Users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!refreshResponse.ok) {
        onSessionExpired?.()
        return response
      }

      const authData = await refreshResponse.json()
      if (authData?.accessToken) {
        await SecureStore.setItemAsync("accessToken", authData.accessToken)
        if (authData.refreshToken) {
          await SecureStore.setItemAsync("refreshToken", authData.refreshToken)
        }
      }

      headers.set("Authorization", `Bearer ${authData.accessToken}`)
      const retryInit: RequestInit = { ...init, headers }
      response = await fetchWithTimeout(input, retryInit)
    }

    return response
  }

  const client = createClient<paths>({
    baseUrl,
    fetch: authFetch as typeof fetch,
  })

  return {
    client,
    setSessionExpiredCallback(callback: () => void) {
      onSessionExpired = callback
    },
  }
}

export const apiClientInstance = createApiClient()
