import type { DraftFormData } from "@/utils/recipeDraftHelpers"
import type { IngredientSection, RecipeDirection, RecipeImage } from "@/types/recipe"

export type RecipeDraftItem = {
  draftId: string
  cookbookId: string
  savedAt: string | Date
  title: string
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

export type { DraftFormData }
