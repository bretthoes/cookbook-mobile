import type { IngredientSectionSnapshotIn } from "@/models/Recipe/IngredientSection"

/** Matches SharedCookbook.Domain.Entities.Recipe.Constraints */
export const MAX_INGREDIENT_SECTIONS = 20
export const MAX_INGREDIENTS_TOTAL = 40

export type IngredientSectionFormRow = {
  id?: number
  title: string
  ingredients: { name: string; optional: boolean | null }[]
}

/**
 * Converts nested ingredient form rows into API/MST-ready sections.
 * Omits completely empty sections (no title and no non-blank ingredient lines).
 */
export function formDataToIngredientSectionsSnapshot(
  formData: { ingredientSections: IngredientSectionFormRow[] },
  options: { sectionIds: "preserve" | "reset" },
): IngredientSectionSnapshotIn[] {
  return formData.ingredientSections
    .map((sec, sIdx) => ({
      id: options.sectionIds === "preserve" ? (sec.id ?? 0) : 0,
      title: (sec.title ?? "").trim(),
      ordinal: sIdx,
      ingredients: sec.ingredients
        .filter((i) => i.name?.trim())
        .map((i, iIdx) => ({
          id: 0,
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
