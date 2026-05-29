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

/**
 * Returns an ISO date string for the Monday of the current week (e.g. "2026-03-23").
 * Used as a stable weekly key for resetting the import count.
 */
export function getCurrentWeekKey(): string {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  return monday.toISOString().split("T")[0]
}

/** True when the form has enough content to represent an abandoned in-progress recipe. */
export function hasDraftContent(formData: DraftFormData): boolean {
  if (formData.title?.trim()) return true
  if (formData.summary?.trim()) return true
  if (formData.images.some((img) => img?.trim())) return true
  if (formData.directions.some((d) => d.text?.trim() || d.image)) return true
  return formData.ingredientSections.some((section) =>
    section.ingredients.some((ingredient) => ingredient.name?.trim()),
  )
}
