import { CookbookListSnapshotIn } from "@/models/generics"
import { CookbookSnapshotIn, CookbookToAddSnapshotIn } from "@/models/Cookbook"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"

const { client } = apiClientInstance

export async function getCookbooks(
  pageNumber = 1,
  pageSize = 10,
): Promise<ApiResult<{ cookbooks: CookbookListSnapshotIn }>> {
  try {
    const { data, error, response } = await client.GET("/api/Cookbooks", {
      params: { query: { PageNumber: pageNumber, PageSize: pageSize } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ cookbooks: data as CookbookListSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function createCookbook(
  cookbook: CookbookToAddSnapshotIn,
): Promise<ApiResult<{ cookbookId: number }>> {
  try {
    const { data, error, response } = await client.POST("/api/Cookbooks", {
      body: { title: cookbook.title, image: cookbook.image ?? undefined },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (data === undefined || data === null) return { kind: "not-found" }
    return toOkResult({ cookbookId: data })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function updateCookbook(
  cookbook: CookbookSnapshotIn,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.PUT("/api/Cookbooks/{id}", {
      params: { path: { id: cookbook.id } },
      body: {
        id: cookbook.id,
        title: cookbook.title ?? undefined,
        image: cookbook.image ?? undefined,
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function deleteCookbook(
  cookbookId: number,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.DELETE("/api/Cookbooks/{id}", {
      params: { path: { id: cookbookId } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}
