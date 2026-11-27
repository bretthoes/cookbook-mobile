import type { AuthResult } from "@/types/auth"
import type { components } from "@/services/api/generated/schema"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"

const { client } = apiClientInstance

export async function login(
  email: string,
  password: string,
): Promise<ApiResult<{ authResult: AuthResult }>> {
  try {
    const { data, error, response } = await client.POST("/api/Users/login", {
      body: { email, password },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "bad-data" }
    const { tokenType, accessToken, expiresIn, refreshToken } = data
    if (!tokenType || !accessToken || !expiresIn || !refreshToken) return { kind: "bad-data" }
    return toOkResult({
      authResult: { tokenType, accessToken, expiresIn, refreshToken },
    })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export type ExternalLoginProvider = components["schemas"]["ExternalLoginProvider"]

export async function loginWithProvider(
  provider: ExternalLoginProvider,
  token: string,
): Promise<ApiResult<{ authResult: AuthResult }>> {
  try {
    const { data, error, response } = await client.POST("/api/Users/login-external", {
      body: { provider, token },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "bad-data" }
    const { tokenType, accessToken, expiresIn, refreshToken } = data
    if (!tokenType || !accessToken || !expiresIn || !refreshToken) return { kind: "bad-data" }
    return toOkResult({
      authResult: { tokenType, accessToken, expiresIn, refreshToken },
    })
  } catch (e) {
    return toProblemFromError(e)
  }
}

/**
 * Identity rejects a registration with 400 and its error codes (DuplicateUserName,
 * InvalidUserName, PasswordTooShort, …) as the keys of `errors`.
 */
export type RegisterResult =
  { kind: "ok" } | { kind: "validation"; codes: string[] } | GeneralApiProblem

export async function register(email: string, password: string): Promise<RegisterResult> {
  try {
    const { error, response } = await client.POST("/api/Users/register", {
      body: { email, password },
    })
    if (response.status === 400) {
      const errors = (error as { errors?: Record<string, unknown> } | undefined)?.errors
      return { kind: "validation", codes: Object.keys(errors ?? {}) }
    }
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function resendConfirmationEmail(
  email: string,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.POST("/api/Users/resendConfirmationEmail", {
      body: { email },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function forgotPassword(email: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.POST("/api/Users/forgotPassword", {
      body: { email },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function resetPassword(
  email: string,
  resetCode: string,
  newPassword: string,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.POST("/api/Users/resetPassword", {
      body: { email, resetCode, newPassword },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function deleteAccount(): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.DELETE("/api/Users/account")
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function getEmail(): Promise<ApiResult<{ email: string }>> {
  try {
    const { data, error, response } = await client.GET("/api/Users/manage/info")
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data?.email) return { kind: "not-found" }
    return toOkResult({ email: data.email })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function updateUser(displayName: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.POST("/api/Users/update", {
      body: { displayName },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function getDisplayName(): Promise<ApiResult<{ displayName: string }>> {
  try {
    const { data, error, response } = await client.GET("/api/Users/display-name")
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ displayName: data.displayName ?? "" })
  } catch (e) {
    return toProblemFromError(e)
  }
}
