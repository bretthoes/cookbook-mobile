import type { components } from "@/services/api/generated/schema"
import type { PaginatedList } from "@/types/pagination"

export type RecipeDetail = components["schemas"]["RecipeDetailedDto"]

export type RecipeBriefItem = components["schemas"]["RecipeBriefDto"] & {
  id: string
  title: string
}

export type RecipeListPage = components["schemas"]["PaginatedListOfRecipeBriefDto"]
export type RecipeList = PaginatedList<RecipeBriefItem>

export type RecipeDirection = components["schemas"]["RecipeDirectionDto"]
export type RecipeImage = components["schemas"]["RecipeImageDto"]
export type RecipeIngredient = components["schemas"]["RecipeIngredientDto"]
export type IngredientSection = components["schemas"]["IngredientSectionDto"]

export type RecipeToAdd = {
  title: string
  cookbookId: string
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
