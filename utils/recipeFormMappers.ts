import type { RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import type { RecipeSnapshotIn, RecipeToAddSnapshotIn } from "@/types/recipe"
import { formDataToIngredientSectionsSnapshot } from "@/utils/recipeIngredientSections"

type RecipeLike = {
  title: string
  summary?: string | null
  preparationTimeInMinutes?: number | null
  cookingTimeInMinutes?: number | null
  bakingTimeInMinutes?: number | null
  servings?: number | null
  ingredientSections?: {
    title: string
    ingredients: { name: string; optional: boolean }[]
  }[]
  directions?: { text: string; image?: string | null }[]
  images?: { name: string }[]
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

export function recipeLikeToFormInputs(recipe: RecipeLike): RecipeFormInputs {
  return {
    title: recipe.title,
    summary: recipe.summary ?? null,
    preparationTimeInMinutes: recipe.preparationTimeInMinutes ?? null,
    cookingTimeInMinutes: recipe.cookingTimeInMinutes ?? null,
    bakingTimeInMinutes: recipe.bakingTimeInMinutes ?? null,
    servings: recipe.servings ?? null,
    ingredientSections:
      recipe.ingredientSections?.map((section) => ({
        title: section.title ?? "",
        ingredients: (section.ingredients ?? []).map((ingredient) => ({
          name: ingredient.name ?? "",
          optional: ingredient.optional ?? null,
        })),
      })) ?? [],
    directions:
      recipe.directions?.map((direction) => ({
        text: direction.text ?? "",
        image: direction.image ?? null,
      })) ?? [],
    images: recipe.images?.map((image) => image.name ?? "") ?? [],
    isVegetarian: recipe.isVegetarian ?? null,
    isVegan: recipe.isVegan ?? null,
    isGlutenFree: recipe.isGlutenFree ?? null,
    isDairyFree: recipe.isDairyFree ?? null,
    isCheap: recipe.isCheap ?? null,
    isHealthy: recipe.isHealthy ?? null,
    isLowFodmap: recipe.isLowFodmap ?? null,
    isHighProtein: recipe.isHighProtein ?? null,
    isBreakfast: recipe.isBreakfast ?? null,
    isLunch: recipe.isLunch ?? null,
    isDinner: recipe.isDinner ?? null,
    isDessert: recipe.isDessert ?? null,
    isSnack: recipe.isSnack ?? null,
  }
}

export function formInputsToRecipeSnapshotIn(
  formData: RecipeFormInputs,
  existing: RecipeSnapshotIn,
): RecipeSnapshotIn {
  const validDirections = formData.directions
    .filter((direction) => direction.text?.trim())
    .map((direction, index) => ({
      text: direction.text.trim(),
      ordinal: index + 1,
      image: direction.image || null,
    }))

  const validImages = formData.images
    .filter((image) => image?.trim())
    .map((image, index) => ({
      name: image.trim(),
      ordinal: index + 1,
    }))

  return {
    ...existing,
    id: existing.id,
    title: formData.title.trim(),
    summary: formData.summary?.trim() || null,
    preparationTimeInMinutes: formData.preparationTimeInMinutes,
    cookingTimeInMinutes: formData.cookingTimeInMinutes,
    bakingTimeInMinutes: formData.bakingTimeInMinutes,
    servings: formData.servings,
    directions: validDirections,
    ingredientSections: formDataToIngredientSectionsSnapshot(formData),
    images: validImages,
    isVegetarian: formData.isVegetarian ?? null,
    isVegan: formData.isVegan ?? null,
    isGlutenFree: formData.isGlutenFree ?? null,
    isDairyFree: formData.isDairyFree ?? null,
    isCheap: formData.isCheap ?? null,
    isHealthy: formData.isHealthy ?? null,
    isLowFodmap: formData.isLowFodmap ?? null,
    isHighProtein: formData.isHighProtein ?? null,
    isBreakfast: formData.isBreakfast ?? null,
    isLunch: formData.isLunch ?? null,
    isDinner: formData.isDinner ?? null,
    isDessert: formData.isDessert ?? null,
    isSnack: formData.isSnack ?? null,
  }
}

export function updateDtoToFormInputs(dto: RecipeSnapshotIn): RecipeFormInputs {
  return recipeLikeToFormInputs(dto)
}

export function recipeToAddToFormInputs(recipe: RecipeToAddSnapshotIn): RecipeFormInputs {
  return recipeLikeToFormInputs(recipe)
}
