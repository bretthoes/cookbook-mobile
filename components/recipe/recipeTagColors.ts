/** All recipe tag keys that support chip coloring. */
export type RecipeTagKey =
  | "isVegetarian"
  | "isVegan"
  | "isGlutenFree"
  | "isDairyFree"
  | "isCheap"
  | "isHealthy"
  | "isLowFodmap"
  | "isHighProtein"
  | "isBreakfast"
  | "isLunch"
  | "isDinner"
  | "isDessert"
  | "isSnack"

/** Soft muted palette — harmonizes with warm cream/rose app theme. */
export const RECIPE_TAG_PALETTE = {
  sage: "#7A9E7E",
  softTeal: "#7A9E9E",
  /** Matches theme `colors.tint` / `palette.primary500`. */
  rose: "#BA7F79",
  wheat: "#B8A67A",
  lavender: "#A89BB8",
} as const

export const RECIPE_TAG_CHIP_COLORS: Record<RecipeTagKey, string> = {
  isVegetarian: RECIPE_TAG_PALETTE.sage,
  isVegan: RECIPE_TAG_PALETTE.sage,
  isGlutenFree: RECIPE_TAG_PALETTE.softTeal,
  isDairyFree: RECIPE_TAG_PALETTE.softTeal,
  isHealthy: RECIPE_TAG_PALETTE.softTeal,
  isLowFodmap: RECIPE_TAG_PALETTE.softTeal,
  isHighProtein: RECIPE_TAG_PALETTE.rose,
  isCheap: RECIPE_TAG_PALETTE.wheat,
  isBreakfast: RECIPE_TAG_PALETTE.wheat,
  isLunch: RECIPE_TAG_PALETTE.wheat,
  isDinner: RECIPE_TAG_PALETTE.wheat,
  isDessert: RECIPE_TAG_PALETTE.lavender,
  isSnack: RECIPE_TAG_PALETTE.lavender,
}

export const RECIPE_TAG_CHIP_TEXT_COLOR = "#FFFFFF"

export function getRecipeTagChipColor(key: string): string | undefined {
  return RECIPE_TAG_CHIP_COLORS[key as RecipeTagKey]
}

/** Tag chips always use white label text (background arg ignored). */
export function getContrastingTextColor(_backgroundColor: string): string {
  return RECIPE_TAG_CHIP_TEXT_COLOR
}
