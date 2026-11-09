import Config from "@/config"
import type { components } from "@/services/api/generated/schema"
import type {
  RecipeListSnapshotIn,
  RecipeSnapshotIn,
  RecipeSnapshotOut,
  RecipeToAddSnapshotIn,
} from "@/types/recipe"
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

/** AI / video recipe imports often exceed the default 10s API client timeout. */
const RECIPE_AI_IMPORT_TIMEOUT_MS = 35_000

/** A full-recipe rewrite is still in flight past 10s and can include one OpenAI retry. */
const RECIPE_AI_APPLY_TIMEOUT_MS = 45_000

const { client } = apiClientInstance

export async function getRecipes(
  cookbookId: string,
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
  recipeId: string,
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
): Promise<ApiResult<{ recipeId: string }>> {
  try {
    const { data, error, response } = await client.POST("/api/Recipes", {
      body: {
        recipe: recipe as unknown as { cookbookId: string; title: string } & Record<
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
): Promise<ApiResult<{ recipeId: string }>> {
  try {
    const { error, response } = await client.PUT("/api/Recipes/{id}", {
      params: { path: { id: recipe.id } },
      body: {
        recipe: recipe as unknown as { id: string; title: string } & Record<string, unknown>,
      },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return toOkResult({ recipeId: recipe.id })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function recordRecipeMade(
  recipeId: string,
): Promise<{ kind: "ok" } | GeneralApiProblem> {
  try {
    const { error, response } = await client.POST("/api/Recipes/{id}/made", {
      params: { path: { id: recipeId } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    return { kind: "ok" }
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function deleteRecipe(recipeId: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
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
    const { data, error, response } = await client.POST("/api/Recipes/parse-from-url", {
      body: { url },
      timeout: RECIPE_AI_IMPORT_TIMEOUT_MS,
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
    const { data, error, response } = await client.POST("/api/Recipes/parse-from-voice", {
      body: { transcript },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as unknown as RecipeToAddSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function applyRecipeEditFromPrompt(
  prompt: string,
  recipe: components["schemas"]["RecipeDto"],
): Promise<ApiResult<{ recipe: components["schemas"]["RecipeDto"] }>> {
  try {
    const { data, error, response } = await client.POST("/api/Recipes/apply-prompt", {
      body: { prompt, recipe },
      timeout: RECIPE_AI_APPLY_TIMEOUT_MS,
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as components["schemas"]["RecipeDto"] })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function extractRecipeFromSocialUrl(
  url: string,
): Promise<ApiResult<{ recipe: RecipeToAddSnapshotIn }>> {
  const baseUrl = Config.API_URL.replace(/\/api\/?$/, "")
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), RECIPE_AI_IMPORT_TIMEOUT_MS)

  try {
    const accessToken = await SecureStore.getItemAsync("accessToken")
    const response = await fetch(`${baseUrl}/api/Recipes/parse-from-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ url, extractFromVideo: true }),
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
  const baseUrl = Config.API_URL.replace(/\/api\/?$/, "")
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), RECIPE_AI_IMPORT_TIMEOUT_MS)

  try {
    const formData = new FormData()
    const fileName = image.fileName ?? image.uri.split("/").pop()?.split("?")[0] ?? "image.jpg"
    formData.append("file", {
      uri: image.uri,
      name: fileName,
      type: image.mimeType ?? "image/jpeg",
    } as unknown as Blob)

    const accessToken = await SecureStore.getItemAsync("accessToken")
    const response = await fetch(`${baseUrl}/api/Recipes/parse-from-image`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (!response.ok) return toProblemFromResponse(response, null)
    const data = await response.json()
    if (!data) return { kind: "not-found" }
    return toOkResult({ recipe: data as unknown as RecipeToAddSnapshotIn })
  } catch (e) {
    clearTimeout(timeoutId)
    return toProblemFromError(e)
  }
}
