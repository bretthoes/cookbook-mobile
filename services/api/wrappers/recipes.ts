import Config from "@/config"
import { RecipeSnapshotIn, RecipeSnapshotOut, RecipeToAddSnapshotIn } from "@/models/Recipe"
import { RecipeListSnapshotIn } from "@/models/generics"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"
import { ImagePickerAsset } from "expo-image-picker"
import * as SecureStore from "expo-secure-store"

const { client } = apiClientInstance

export async function getRecipes(
  cookbookId: number,
  search: string,
  pageNumber: number,
  pageSize: number,
): Promise<ApiResult<{ recipes: RecipeListSnapshotIn }>> {
  try {
    const { data, error, response } = await client.GET("/api/Recipes", {
      params: {
        query: {
          CookbookId: cookbookId,
          Search: search || undefined,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipes: data as RecipeListSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function getRecipe(
  recipeId: number,
): Promise<ApiResult<{ recipe: RecipeSnapshotOut }>> {
  try {
    const { data, error, response } = await client.GET("/api/Recipes/{id}", {
      params: { path: { id: recipeId } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as RecipeSnapshotOut })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function createRecipe(
  recipe: RecipeToAddSnapshotIn,
): Promise<ApiResult<{ recipeId: number }>> {
  try {
    const { data, error, response } = await client.POST("/api/Recipes", {
      body: {
        recipe: recipe as unknown as { cookbookId: number; title: string } & Record<
          string,
          unknown
        >,
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (data === undefined || data === null) return { kind: "not-found" }
    return toOkResult({ recipeId: data })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function updateRecipe(
  recipe: RecipeSnapshotIn,
): Promise<ApiResult<{ recipeId: number }>> {
  try {
    const { error, response } = await client.PUT("/api/Recipes/{id}", {
      params: { path: { id: recipe.id } },
      body: { recipe: recipe as unknown as { id: number } & Record<string, unknown> },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return toOkResult({ recipeId: recipe.id })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function deleteRecipe(recipeId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.DELETE("/api/Recipes/{id}", {
      params: { path: { id: recipeId } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function extractRecipeFromUrl(
  url: string,
): Promise<ApiResult<{ recipe: RecipeToAddSnapshotIn }>> {
  try {
    const { data, error, response } = await client.POST("/api/Recipes/parse-recipe-url", {
      body: { url },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as unknown as RecipeToAddSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function extractRecipeFromVoice(
  transcript: string,
): Promise<ApiResult<{ recipe: RecipeToAddSnapshotIn }>> {
  try {
    const { data, error, response } = await client.POST(
      "/api/Recipes/parse-recipe-voice" as never,
      { body: { transcript } } as never,
    )
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as unknown as RecipeToAddSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

const SOCIAL_IMPORT_TIMEOUT_MS = 35_000

export async function extractRecipeFromSocialUrl(
  url: string,
  platform: string,
): Promise<ApiResult<{ recipe: RecipeToAddSnapshotIn }>> {
  const baseUrl = Config.API_URL.replace(/\/api\/?$/, "")
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SOCIAL_IMPORT_TIMEOUT_MS)

  try {
    const accessToken = await SecureStore.getItemAsync("accessToken")
    const response = await fetch(`${baseUrl}/api/Recipes/parse-recipe-social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ url, platform }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return toProblemFromResponse(response, null)
    const data = await response.json()
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as RecipeToAddSnapshotIn })
  } catch (e) {
    clearTimeout(timeoutId)
    return toProblemFromError(e)
  }
}

export async function extractRecipeFromImage(
  image: ImagePickerAsset,
): Promise<ApiResult<{ recipe: RecipeToAddSnapshotIn }>> {
  try {
    const formData = new FormData()
    formData.append("file", {
      uri: image.uri,
      name: image.fileName ?? "image.jpg",
      type: image.mimeType ?? "image/jpeg",
    } as unknown as Blob)

    const { data, error, response } = await client.POST("/api/Recipes/parse-recipe-img", {
      body: formData as never,
      bodySerializer: (b) => b as FormData,
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as unknown as RecipeToAddSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}
