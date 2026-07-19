import type { RecipeDraftItem } from "@/types/recipeDraft"
import { hasMeaningfulText } from "@/utils/hasMeaningfulText"
import { formDataToIngredientSectionsSnapshot } from "@/utils/recipeIngredientSections"

export const WEEKLY_IMPORT_LIMIT = 5

/** Minimal form shape accepted by saveDraft — mirrors RecipeFormInputs from RecipeForm */
export interface DraftFormData {
  title: string
  summary?: string | null
  preparationTimeInMinutes?: number | null
  cookingTimeInMinutes?: number | null
  bakingTimeInMinutes?: number | null
  servings?: number | null
  ingredientSections: {
    id?: number
    title: string
    ingredients: { name: string; optional: boolean | null }[]
  }[]
  directions: { text: string; image: string | null }[]
  images: string[]
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

export type DraftContentFields = Pick<
  RecipeDraftItem,
  "title" | "summary" | "images" | "directions" | "ingredientSections"
>

export type DraftFieldsFromForm = Omit<
  RecipeDraftItem,
  "draftId" | "cookbookId" | "thumbnail" | "videoPath" | "savedAt"
>

export function getCurrentWeekKey(): string {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().split("T")[0]
}

/** Backend/AI placeholder when no recipe name is found — not user draft content. */
export function isPlaceholderDraftTitle(title?: string | null): boolean {
  if (!hasMeaningfulText(title)) return true
  return title!.replace(/\u00A0/g, " ").trim().toLowerCase() === "untitled recipe"
}

export function draftItemHasContent(draft: DraftContentFields): boolean {
  if (hasMeaningfulText(draft.summary)) return true
  if (draft.images?.some((img) => hasMeaningfulText(img.name))) return true
  if (
    draft.directions?.some(
      (d) => hasMeaningfulText(d.text) || hasMeaningfulText(d.image),
    )
  ) {
    return true
  }
  if (
    draft.ingredientSections?.some(
      (section) =>
        hasMeaningfulText(section.title) ||
        section.ingredients?.some((ingredient) => hasMeaningfulText(ingredient.name)),
    )
  ) {
    return true
  }
  return hasMeaningfulText(draft.title) && !isPlaceholderDraftTitle(draft.title)
}

export function hasDraftContent(formData: DraftFormData): boolean {
  return draftItemHasContent({
    title: formData.title,
    summary: formData.summary ?? null,
    images: formData.images.filter(Boolean).map((name) => ({ name })),
    directions: formData.directions,
    ingredientSections: formData.ingredientSections,
  })
}

/** Normalizes form data into persisted draft field shape (without ids/metadata). */
export function buildDraftFieldsFromFormData(formData: DraftFormData): DraftFieldsFromForm {
  const validIngredientSections = formDataToIngredientSectionsSnapshot(
    { ingredientSections: formData.ingredientSections },
    { sectionIds: "reset" },
  )
  const validDirections = formData.directions
    .filter((d) => hasMeaningfulText(d.text) || hasMeaningfulText(d.image))
    .map((d, idx) => ({
      id: 0,
      text: hasMeaningfulText(d.text) ? d.text.replace(/\u00A0/g, " ").trim() : "",
      ordinal: idx + 1,
      image: d.image ?? null,
    }))
  const validImages = formData.images
    .filter((img) => hasMeaningfulText(img))
    .map((img, idx) => ({ id: 0, name: img.replace(/\u00A0/g, " ").trim(), ordinal: idx + 1 }))

  return {
    title: hasMeaningfulText(formData.title)
      ? formData.title.replace(/\u00A0/g, " ").trim()
      : "",
    summary: hasMeaningfulText(formData.summary)
      ? formData.summary!.replace(/\u00A0/g, " ").trim()
      : null,
    preparationTimeInMinutes: formData.preparationTimeInMinutes ?? null,
    cookingTimeInMinutes: formData.cookingTimeInMinutes ?? null,
    bakingTimeInMinutes: formData.bakingTimeInMinutes ?? null,
    servings: formData.servings ?? null,
    ingredientSections: validIngredientSections,
    directions: validDirections,
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
