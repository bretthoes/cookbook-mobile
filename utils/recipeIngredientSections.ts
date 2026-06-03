import type { IngredientSectionSnapshotIn } from "@/types/recipe"

/** Matches SharedCookbook.Domain.Entities.Recipe.Constraints */
export const MAX_INGREDIENT_SECTIONS = 20
export const MAX_INGREDIENTS_TOTAL = 40

export type IngredientSectionFormRow = {
  title: string
  ingredients: { name: string; optional: boolean | null }[]
}

/**
 * Converts nested ingredient form rows into API-ready sections.
 * Omits completely empty sections (no title and no non-blank ingredient lines).
 * The second argument is accepted for backwards-compatibility but has no effect
 * since embedded sections no longer carry their own IDs.
 */
export function formDataToIngredientSectionsSnapshot(
  formData: { ingredientSections: IngredientSectionFormRow[] },
  _options?: { sectionIds?: "preserve" | "reset" },
): IngredientSectionSnapshotIn[] {
  return formData.ingredientSections
    .map((sec, sIdx) => ({
      title: (sec.title ?? "").trim(),
      ordinal: sIdx,
      ingredients: sec.ingredients
        .filter((i) => i.name?.trim())
        .map((i, iIdx) => ({
          name: i.name.trim(),
          optional: i.optional ?? false,
          ordinal: iIdx + 1,
        })),
    }))
    .filter((s) => s.ingredients.length > 0 || s.title.length > 0)
}

export function countIngredientsInForm(formData: {
  ingredientSections: IngredientSectionFormRow[]
}): number {
  return formData.ingredientSections.reduce(
    (n, sec) => n + sec.ingredients.filter((i) => i.name?.trim()).length,
    0,
  )
}
