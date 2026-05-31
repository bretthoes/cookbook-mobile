import type { MembershipListSnapshotIn, MembershipTier } from "@/types/membership"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"

const { client } = apiClientInstance

export async function GetMemberships(
  cookbookId: number,
  pageNumber: number,
  pageSize: number,
): Promise<ApiResult<{ memberships: MembershipListSnapshotIn }>> {
  try {
    const { data, error, response } = await client.GET("/api/Memberships", {
      params: {
        query: {
          CookbookId: cookbookId,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ memberships: data as MembershipListSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function getMembership(
  cookbookId: number,
): Promise<ApiResult<{ membership: import("@/types/membership").MembershipSnapshotOut }>> {
  try {
    const { data, error, response } = await client.GET(
      "/api/Memberships/by-cookbook/{cookbookId}",
      {
        params: { path: { cookbookId } },
      },
    )
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ membership: data as import("@/types/membership").MembershipSnapshotOut })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function updateMembership(
  membershipId: number,
  tier: MembershipTier,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.PUT("/api/Memberships/{id}", {
      params: { path: { id: membershipId } },
      body: {
        id: membershipId,
        tier,
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function deleteMembership(
  membershipId: number,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.DELETE("/api/Memberships/{id}", {
      params: { path: { id: membershipId } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}
