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
