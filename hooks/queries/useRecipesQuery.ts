import type {
  RecipeBriefItem,
  RecipeDetail,
  RecipeListPage,
  RecipeSnapshotIn,
  RecipeToAddSnapshotIn,
} from "@/types/recipe"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { api } from "@/services/api"
import { getRecipe, getRecipes, recordRecipeMade } from "@/services/api/wrappers/recipes"
import { invalidateRecipeLists } from "@/services/query/invalidateQueries"
import { queryKeys } from "@/services/query/queryKeys"
import { ApiQueryError, unwrapApiResult } from "@/services/query/unwrapApiResult"
import { useUiStore } from "@/stores/uiStore"
import {
  ensureMinimumElapsed,
  RECIPE_IMPORT_MIN_LOADING_MS,
  RECIPE_SOCIAL_IMPORT_MIN_LOADING_MS,
} from "@/utils/minimumLoadingDelay"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const RECIPE_LIST_PAGE_SIZE = 50

export type RecipeImportFailureKind = GeneralApiProblem["kind"]

function normalizeRecipeList(page: RecipeListPage) {
  return {
    items: (page.items ?? []) as RecipeBriefItem[],
    pageNumber: page.pageNumber ?? 1,
    totalPages: page.totalPages ?? 1,
    totalCount: page.totalCount ?? 0,
    hasNextPage: page.hasNextPage ?? false,
  }
}

async function fetchRecipesPage(cookbookId: string, search: string, pageNumber: number) {
  const result = await getRecipes(cookbookId, search, pageNumber, RECIPE_LIST_PAGE_SIZE)
  const data = unwrapApiResult(result)
  return normalizeRecipeList(data.recipes)
}

export function useRecipesInfiniteQuery(cookbookId: string, search = "") {
  return useInfiniteQuery({
    queryKey: queryKeys.recipes.list(cookbookId, search),
    queryFn: ({ pageParam }) => fetchRecipesPage(cookbookId, search, pageParam),
    initialPageParam: 1,
    enabled: !!cookbookId,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.pageNumber >= lastPage.totalPages) return undefined
      return lastPageParam + 1
    },
  })
}

export function useRecipesList(cookbookId: string, search = "") {
  const query = useRecipesInfiniteQuery(cookbookId, search)
  const recipes = query.data?.pages.flatMap((p) => p.items) ?? []
  const lastPage = query.data?.pages.at(-1)
  return {
    ...query,
    recipes,
    listHasNextPage: (lastPage?.pageNumber ?? 1) < (lastPage?.totalPages ?? 1),
    isListPending: query.isPending && recipes.length === 0,
    isListEmpty: query.isSuccess && recipes.length === 0,
    isLoadingMore: query.isFetchingNextPage,
  }
}

export function useRecipeQuery(recipeId: string) {
  return useQuery({
    queryKey: queryKeys.recipes.detail(recipeId),
    queryFn: async () => {
      const result = await getRecipe(recipeId)
      const data = unwrapApiResult(result)
      return data.recipe as RecipeDetail
    },
    enabled: !!recipeId,
    retry: (failureCount, error) => {
      if (error instanceof ApiQueryError && error.problem.kind === "not-found") return false
      return failureCount < 1
    },
  })
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (recipe: RecipeToAddSnapshotIn) => {
      const result = await api.createRecipe(recipe)
      return unwrapApiResult(result)
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.recipes.list(variables.cookbookId, ""),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (recipe: RecipeSnapshotIn) => {
      const result = await api.updateRecipe(recipe)
      if (result.kind !== "ok") throw new Error(result.kind)
      return recipe
    },
    onSuccess: (recipe) => {
      queryClient.setQueryData(queryKeys.recipes.detail(recipe.id), recipe as RecipeDetail)
      void invalidateRecipeLists(queryClient)
    },
  })
}

export function useRecordRecipeMadeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (recipeId: string) => {
      const result = await recordRecipeMade(recipeId)
      unwrapApiResult(result)
      return recipeId
    },
    onSuccess: (recipeId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.recipes.detail(recipeId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    },
  })
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (recipeId: string) => {
      const result = await api.deleteRecipe(recipeId)
      if (result.kind !== "ok") throw new Error(result.kind)
      return recipeId
    },
    onMutate: (recipeId) => {
      void queryClient.cancelQueries({ queryKey: queryKeys.recipes.detail(recipeId) })
    },
    onSuccess: (recipeId) => {
      queryClient.removeQueries({ queryKey: queryKeys.recipes.detail(recipeId) })
      void invalidateRecipeLists(queryClient)
    },
  })
}

export function useImportRecipeFromUrlMutation() {
  const incrementImportCount = useUiStore((s) => s.incrementImportCount)
  const setRecipeToAdd = useUiStore((s) => s.setRecipeToAdd)
  return useMutation({
    mutationFn: async (url: string) => {
      const startTime = Date.now()
      const response = await api.extractRecipeFromUrl(url)
      await ensureMinimumElapsed(startTime, RECIPE_IMPORT_MIN_LOADING_MS)
      if (response.kind === "ok") {
        incrementImportCount()
        setRecipeToAdd(response.recipe)
        return { ok: true as const }
      }
      return { ok: false as const, kind: response.kind as RecipeImportFailureKind }
    },
  })
}

export function useImportRecipeFromSocialUrlMutation() {
  const incrementImportCount = useUiStore((s) => s.incrementImportCount)
  const setRecipeToAdd = useUiStore((s) => s.setRecipeToAdd)
  return useMutation({
    mutationFn: async (url: string) => {
      const startTime = Date.now()
      const response = await api.extractRecipeFromSocialUrl(url)
      await ensureMinimumElapsed(startTime, RECIPE_SOCIAL_IMPORT_MIN_LOADING_MS)
      if (response.kind === "ok") {
        incrementImportCount()
        setRecipeToAdd(response.recipe)
        return { ok: true as const }
      }
      return { ok: false as const, kind: response.kind as RecipeImportFailureKind }
    },
  })
}

export function useImportRecipeFromVoiceMutation() {
  const incrementImportCount = useUiStore((s) => s.incrementImportCount)
  const setRecipeToAdd = useUiStore((s) => s.setRecipeToAdd)
  return useMutation({
    mutationFn: async (transcript: string) => {
      const response = await api.extractRecipeFromVoice(transcript)
      if (response.kind === "ok") {
        incrementImportCount()
        setRecipeToAdd(response.recipe)
        return { ok: true as const }
      }
      return { ok: false as const, kind: response.kind as RecipeImportFailureKind }
    },
  })
}

export function useImportRecipeFromImageMutation() {
  const incrementImportCount = useUiStore((s) => s.incrementImportCount)
  const setRecipeToAdd = useUiStore((s) => s.setRecipeToAdd)
  return useMutation({
    mutationFn: async (image: import("expo-image-picker").ImagePickerAsset) => {
      const response = await api.extractRecipeFromImage(image)
      if (response.kind === "ok") {
        incrementImportCount()
        setRecipeToAdd(response.recipe)
        return { ok: true as const }
      }
      return { ok: false as const, kind: response.kind as RecipeImportFailureKind }
    },
  })
}

export function useApplyRecipeEditFromPromptMutation() {
  const incrementImportCount = useUiStore((s) => s.incrementImportCount)
  return useMutation({
    mutationFn: async ({
      recipeId,
      prompt,
      recipe,
    }: {
      recipeId: string
      prompt: string
      recipe: import("@/types/recipe").RecipeSnapshotIn
    }) => {
      const response = await api.applyRecipeEditFromPrompt(recipeId, prompt, recipe)
      if (response.kind === "ok") {
        incrementImportCount()
        return { ok: true as const, recipe: response.recipe }
      }
      return { ok: false as const, kind: response.kind as RecipeImportFailureKind }
    },
  })
}
