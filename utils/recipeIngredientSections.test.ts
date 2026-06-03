import { describe, expect, it } from "vitest"
import {
  countIngredientsInForm,
  formDataToIngredientSectionsSnapshot,
  MAX_INGREDIENT_SECTIONS,
  MAX_INGREDIENTS_TOTAL,
} from "@/utils/recipeIngredientSections"

describe("recipeIngredientSections", () => {
  it("exports backend-aligned limits", () => {
    expect(MAX_INGREDIENT_SECTIONS).toBe(20)
    expect(MAX_INGREDIENTS_TOTAL).toBe(40)
  })
})

describe("formDataToIngredientSectionsSnapshot", () => {
  const baseForm = {
    ingredientSections: [
      {
        id: 5,
        title: "  Sauce ",
        ingredients: [
          { name: "  flour  ", optional: null },
          { name: "   ", optional: false },
        ],
      },
      {
        title: "",
        ingredients: [{ name: "", optional: false }],
      },
    ],
  }

  it("trims names and drops blank ingredient lines", () => {
    const result = formDataToIngredientSectionsSnapshot(baseForm)
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      title: "Sauce",
      ordinal: 0,
      ingredients: [{ name: "flour", optional: false, ordinal: 1 }],
    })
  })

  it("omits sections with no title and no ingredients", () => {
    const result = formDataToIngredientSectionsSnapshot(
      {
        ingredientSections: [{ title: "", ingredients: [{ name: "  ", optional: false }] }],
      },
      { sectionIds: "reset" },
    )
    expect(result).toHaveLength(0)
  })

  it("keeps a titled section with no ingredients", () => {
    const result = formDataToIngredientSectionsSnapshot(
      {
        ingredientSections: [{ title: "Garnish", ingredients: [] }],
      },
      { sectionIds: "reset" },
    )
    expect(result).toHaveLength(1)
    expect(result[0]?.title).toBe("Garnish")
    expect(result[0]?.ingredients).toHaveLength(0)
  })
})

describe("countIngredientsInForm", () => {
  it("counts only non-blank ingredient names", () => {
    expect(
      countIngredientsInForm({
        ingredientSections: [
          {
            title: "",
            ingredients: [
              { name: "egg", optional: false },
              { name: " ", optional: false },
            ],
          },
          {
            title: "",
            ingredients: [{ name: "milk", optional: true }],
          },
        ],
      }),
    ).toBe(2)
  })

  it("returns zero for empty form", () => {
    expect(countIngredientsInForm({ ingredientSections: [] })).toBe(0)
  })
})

describe("formDataToIngredientSectionsSnapshot ordinals", () => {
  it("assigns section and ingredient ordinals", () => {
    const result = formDataToIngredientSectionsSnapshot(
      {
        ingredientSections: [
          {
            title: "Base",
            ingredients: [
              { name: "a", optional: null },
              { name: "b", optional: true },
            ],
          },
          {
            title: "Topping",
            ingredients: [{ name: "c", optional: false }],
          },
        ],
      },
      { sectionIds: "reset" },
    )
    expect(result[0]?.ordinal).toBe(0)
    expect(result[0]?.ingredients.map((i) => i.ordinal)).toEqual([1, 2])
    expect(result[1]?.ordinal).toBe(1)
    expect(result[0]?.ingredients[0]?.optional).toBe(false)
    expect(result[0]?.ingredients[1]?.optional).toBe(true)
  })
})
