/**
 * OpenAPI-fetch client with auth middleware, token refresh, and session expiry handling.
 */
import Config from "@/config"
import { createFetchWithTimeout } from "@/services/api/fetchWithTimeout"
import type { paths } from "@/services/api/generated/schema"
import type { ApiConfig } from "@/services/api/types"
import createClient from "openapi-fetch"
import * as SecureStore from "expo-secure-store"

/** In-memory access token — updated synchronously on login so requests never read stale SecureStore. */
let memoryAccessToken: string | null = null

/** Bumped on login/logout so stale in-flight 401 refresh cannot log out a new session. */
let authSessionId = 0

export function setAccessToken(token: string | null) {
  memoryAccessToken = token
}

export function getAccessToken(): string | null {
  return memoryAccessToken
}

export function bumpAuthSession() {
  authSessionId += 1
}

/** Paths that do not require Authorization header */
const UNPROTECTED_PATHS = [
  "/api/Users/login",
  "/api/Users/login-google",
  "/api/Users/login-apple",
  "/api/Users/login-facebook",
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
  let onAccessTokenRefreshed: ((accessToken: string) => void) | undefined
  let refreshInFlight: Promise<string | null> | null = null

  async function resolveAccessToken(): Promise<string | null> {
    if (memoryAccessToken) return memoryAccessToken
    const stored = await SecureStore.getItemAsync("accessToken")
    if (stored) memoryAccessToken = stored
    return stored
  }

  function expireSessionIfCurrent(sessionAtStart: number) {
    if (sessionAtStart === authSessionId) onSessionExpired?.()
  }

  async function refreshAccessToken(): Promise<string | null> {
    if (refreshInFlight) return refreshInFlight

    const sessionAtStart = authSessionId

    refreshInFlight = (async () => {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")
      if (!refreshToken) {
        expireSessionIfCurrent(sessionAtStart)
        return null
      }

      const refreshResponse = await fetchWithTimeout(`${baseUrl}/api/Users/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })

      if (!refreshResponse.ok) {
        expireSessionIfCurrent(sessionAtStart)
        return null
      }

      const authData = await refreshResponse.json()
      if (!authData?.accessToken) {
        expireSessionIfCurrent(sessionAtStart)
        return null
      }

      if (sessionAtStart !== authSessionId) return null

      const accessToken = authData.accessToken as string
      setAccessToken(accessToken)
      await SecureStore.setItemAsync("accessToken", accessToken)
      if (authData.refreshToken) {
        await SecureStore.setItemAsync("refreshToken", authData.refreshToken)
      }
      onAccessTokenRefreshed?.(accessToken)
      return accessToken
    })()

    try {
      return await refreshInFlight
    } finally {
      refreshInFlight = null
    }
  }

  async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : (input as Request).url
    const isUnprotected = UNPROTECTED_PATHS.some((p) => url.includes(p))

    const existingHeaders =
      init?.headers ?? (input instanceof Request ? (input as Request).headers : undefined)
    const headers = new Headers(existingHeaders)
    if (!isUnprotected) {
      const accessToken = await resolveAccessToken()
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`)
      }
    }
    headers.set("Accept", "application/json")

    const requestInit: RequestInit = { ...init, headers }

    let response = await fetchWithTimeout(input, requestInit)

    if (response.status === 401 && !url.includes("/Users/refresh")) {
      const newAccessToken = await refreshAccessToken()
      if (!newAccessToken) return response

      headers.set("Authorization", `Bearer ${newAccessToken}`)
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
    setOnAccessTokenRefreshed(callback: (accessToken: string) => void) {
      onAccessTokenRefreshed = callback
    },
  }
}

export const apiClientInstance = createApiClient()
