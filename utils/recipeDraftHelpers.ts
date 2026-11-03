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

/** Local calendar date `YYYY-MM-DD`. `toISOString()` would shift the day west of UTC. */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** Monday 00:00 local time for the week that contains `now`. */
function startOfLocalWeek(now: Date): Date {
  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)
  const day = monday.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(monday.getDate() + diff)
  return monday
}

function parseLocalDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

/**
 * Monday of the current local week, as `YYYY-MM-DD`.
 * Uses the device calendar date so an evening import stays in the same week the next morning.
 */
export function getCurrentWeekKey(now: Date = new Date()): string {
  return formatLocalDate(startOfLocalWeek(now))
}

/**
 * True when `weekKey` belongs to the current local week.
 * Older builds stored `toISOString().slice(0, 10)`, which can be a day off the local Monday.
 */
export function isStoredWeekKeyCurrent(weekKey: string, now: Date = new Date()): boolean {
  const stored = parseLocalDateKey(weekKey)
  if (!stored) return false
  const monday = startOfLocalWeek(now)
  const earliest = new Date(monday)
  earliest.setDate(monday.getDate() - 1)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return stored >= earliest && stored < nextMonday
}

/** Imports already counted this local week, or 0 when the stored week has rolled over. */
export function getEffectiveWeeklyImportCount(
  count: number,
  weekKey: string,
  now: Date = new Date(),
): number {
  return isStoredWeekKeyCurrent(weekKey, now) ? count : 0
}

/** Backend/AI placeholder when no recipe name is found — not user draft content. */
export function isPlaceholderDraftTitle(title?: string | null): boolean {
  if (!hasMeaningfulText(title)) return true
  return (
    title!
      .replace(/\u00A0/g, " ")
      .trim()
      .toLowerCase() === "untitled recipe"
  )
}

export function draftItemHasContent(draft: DraftContentFields): boolean {
  if (hasMeaningfulText(draft.summary)) return true
  if (draft.images?.some((img) => hasMeaningfulText(img.name))) return true
  if (draft.directions?.some((d) => hasMeaningfulText(d.text) || hasMeaningfulText(d.image))) {
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
    title: hasMeaningfulText(formData.title) ? formData.title.replace(/\u00A0/g, " ").trim() : "",
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
