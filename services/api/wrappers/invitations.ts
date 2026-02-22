import { CookbookInvitationStatus, InvitationSnapshotOut } from "@/models/Invitation"
import { InvitationListSnapshotIn } from "@/models/generics"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"

const { client } = apiClientInstance

export async function GetInvitationToken(
  token: string,
): Promise<ApiResult<{ invitation: InvitationSnapshotOut }>> {
  try {
    const { data, error, response } = await client.GET("/api/InvitationTokens/{token}", {
      params: { path: { token } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ invitation: data as InvitationSnapshotOut })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function GetInvitations(
  pageNumber: number,
  pageSize: number,
  status: string | number = "Active",
): Promise<ApiResult<{ invitations: InvitationListSnapshotIn }>> {
  try {
    const statusNum =
      typeof status === "string"
        ? status === "Active"
          ? CookbookInvitationStatus.Active
          : CookbookInvitationStatus.Active
        : status
    const { data, error, response } = await client.GET("/api/Invitations", {
      params: {
        query: {
          PageNumber: pageNumber,
          PageSize: pageSize,
          Status: statusNum as 0 | 1 | 2 | 3 | 4 | 5,
        },
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ invitations: data as InvitationListSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function GetInvitationCount(
  status: number = CookbookInvitationStatus.Active,
): Promise<ApiResult<{ count: number }>> {
  try {
    const { data, error, response } = await client.GET("/api/Invitations/count", {
      params: { query: { Status: status as 0 | 1 | 2 | 3 | 4 | 5 } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return toOkResult({ count: data ?? 0 })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function createInvite(
  cookbookId: number,
  email: string,
): Promise<ApiResult<{ token: string }>> {
  try {
    const { data, error, response } = await client.POST("/api/Invitations", {
      body: { cookbookId, email }, 
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return toOkResult({ token: data !== undefined && data !== null ? String(data) : "" })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function createInviteToken(cookbookId: number): Promise<ApiResult<{ token: string }>> {
  try {
    const { data, error, response } = await client.POST("/api/InvitationTokens", {
      body: { cookbookId },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    const { token } = data as { token: string }
    return toOkResult({ token })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function updateInvite(
  id: number,
  accepted: boolean,
): Promise<ApiResult<{ invitationId: number }>> {
  try {
    const newStatus = accepted
      ? CookbookInvitationStatus.Accepted
      : CookbookInvitationStatus.Rejected
    const { data, error, response } = await client.PUT("/api/Invitations/{id}", {
      params: { path: { id } },
      body: { id, newStatus },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return toOkResult({ invitationId: data ?? id })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function UpdateInvitationToken(
  token: string,
  accepted: boolean,
): Promise<ApiResult<{ invitationId: number }>> {
  try {
    const newStatus = accepted
      ? CookbookInvitationStatus.Accepted
      : CookbookInvitationStatus.Rejected
    const { data, error, response } = await client.PUT("/api/InvitationTokens/{token}", {
      params: { path: { token } },
      body: { token, newStatus },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return toOkResult({ invitationId: data ?? 0 })
  } catch (e) {
    return toProblemFromError(e)
  }
}
