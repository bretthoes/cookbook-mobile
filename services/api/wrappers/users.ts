import { AuthResultSnapshotIn } from "@/models/AuthResult"
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
): Promise<ApiResult<{ authResult: AuthResultSnapshotIn }>> {
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

export async function register(
  email: string,
  password: string,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.POST("/api/Users/register", {
      body: { email, password },
    })
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
