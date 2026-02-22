import { MembershipListSnapshotIn } from "@/models/generics"
import { MembershipSnapshotOut } from "@/models/Membership"
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
): Promise<ApiResult<{ membership: MembershipSnapshotOut }>> {
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
    return toOkResult({ membership: data as MembershipSnapshotOut })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function updateMembership(
  membershipId: number,
  membership: MembershipSnapshotOut,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.PUT("/api/Memberships/{id}", {
      params: { path: { id: membershipId } },
      body: {
        id: membershipId,
        isOwner: membership.isOwner,
        canAddRecipe: membership.canAddRecipe,
        canUpdateRecipe: membership.canUpdateRecipe,
        canDeleteRecipe: membership.canDeleteRecipe,
        canSendInvite: membership.canSendInvite,
        canRemoveMember: membership.canRemoveMember,
        canEditCookbookDetails: membership.canEditCookbookDetails,
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
