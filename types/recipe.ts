import type { components } from "@/services/api/generated/schema"

export type RecipeDetail = components["schemas"]["RecipeDetailedDto"]

export type RecipeSnapshotIn = RecipeDetail
export type RecipeSnapshotOut = RecipeDetail

export type RecipeBriefItem = components["schemas"]["RecipeBriefDto"] & {
  id: number
  title: string
}

export type RecipeListPage = components["schemas"]["PaginatedListOfRecipeBriefDto"]
export type RecipeListSnapshotIn = import("@/types/pagination").PaginatedList<RecipeBriefItem>

export type RecipeDirection = components["schemas"]["RecipeDirectionDto"]
export type RecipeImage = components["schemas"]["RecipeImageDto"]
export type RecipeIngredient = components["schemas"]["RecipeIngredientDto"]
export type IngredientSection = components["schemas"]["IngredientSectionDto"]
export type IngredientSectionSnapshotIn = IngredientSection

export type RecipeToAddSnapshotIn = {
  title: string
  cookbookId: number
  summary?: string | null
  thumbnail?: string | null
  videoPath?: string | null
  preparationTimeInMinutes?: number | null
  cookingTimeInMinutes?: number | null
  bakingTimeInMinutes?: number | null
  servings?: number | null
  directions: RecipeDirection[]
  images: RecipeImage[]
  ingredientSections: IngredientSection[]
  isVegetarian?: boolean | null
  isVegan?: boolean | null
  isGlutenFree?: boolean | null
  isDairyFree?: boolean | null
  isCheap?: boolean | null
  isHealthy?: boolean | null
  isLowFodmap?: boolean | null
  isHighProtein?: boolean | null
  isBreakfast?: boolean | null
  isLunch?: boolean | null
  isDinner?: boolean | null
  isDessert?: boolean | null
  isSnack?: boolean | null
}
