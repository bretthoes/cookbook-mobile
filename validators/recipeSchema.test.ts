import { describe, expect, it, vi } from "vitest"

vi.mock("@/i18n", () => ({
  translate: (key: string) => key,
}))

import { recipeSchema } from "@/validators/recipeSchema"

function minimalRecipe(overrides: Record<string, unknown> = {}) {
  return {
    title: "Tomato Soup",
    summary: null,
    preparationTimeInMinutes: null,
    cookingTimeInMinutes: null,
    bakingTimeInMinutes: null,
    servings: null,
    ingredientSections: [
      {
        title: "",
        ingredients: [{ name: "tomato", optional: false }],
      },
    ],
    directions: [{ text: "Simmer", image: null }],
    images: [],
    isVegetarian: null,
    isVegan: null,
    isGlutenFree: null,
    isDairyFree: null,
    isCheap: null,
    isHealthy: null,
    isLowFodmap: null,
    isHighProtein: null,
    isBreakfast: null,
    isLunch: null,
    isDinner: null,
    isDessert: null,
    isSnack: null,
    ...overrides,
  }
}

describe("recipeSchema", () => {
  it("accepts a minimal valid recipe", async () => {
    await expect(recipeSchema.validate(minimalRecipe())).resolves.toBeDefined()
  })

  it("requires a non-empty title up to 255 characters", async () => {
    await expect(recipeSchema.validate(minimalRecipe({ title: "" }))).rejects.toThrow()
    await expect(
      recipeSchema.validate(minimalRecipe({ title: "x".repeat(256) })),
    ).rejects.toThrow()
  })

  it("accepts null time fields and positive integers", async () => {
    const result = await recipeSchema.validate(
      minimalRecipe({
        preparationTimeInMinutes: 30,
        servings: 4,
      }),
    )
    expect(result.preparationTimeInMinutes).toBe(30)
    expect(result.servings).toBe(4)
  })

  it("rejects more than 20 ingredient sections", async () => {
    const sections = Array.from({ length: 21 }, () => ({
      title: "",
      ingredients: [{ name: "a", optional: false }],
    }))
    await expect(
      recipeSchema.validate(minimalRecipe({ ingredientSections: sections })),
    ).rejects.toThrow()
  })

  it("rejects more than 40 ingredients across sections", async () => {
    const ingredients = Array.from({ length: 41 }, (_, i) => ({
      name: `item-${i}`,
      optional: false,
    }))
    await expect(
      recipeSchema.validate(
        minimalRecipe({
          ingredientSections: [{ title: "", ingredients }],
        }),
      ),
    ).rejects.toThrow()
  })

  it("allows exactly 40 named ingredients", async () => {
    const ingredients = Array.from({ length: 40 }, (_, i) => ({
      name: `item-${i}`,
      optional: false,
    }))
    await expect(
      recipeSchema.validate(
        minimalRecipe({
          ingredientSections: [{ title: "", ingredients }],
        }),
      ),
    ).resolves.toBeDefined()
  })

  it("ignores blank ingredient names in the total count", async () => {
    const ingredients = [
      ...Array.from({ length: 40 }, (_, i) => ({ name: `item-${i}`, optional: false })),
      { name: "   ", optional: false },
    ]
    await expect(
      recipeSchema.validate(
        minimalRecipe({
          ingredientSections: [{ title: "", ingredients }],
        }),
      ),
    ).resolves.toBeDefined()
  })

  it("limits images and directions", async () => {
    await expect(
      recipeSchema.validate(minimalRecipe({ images: Array.from({ length: 7 }, () => "a.jpg") })),
    ).rejects.toThrow()
    await expect(
      recipeSchema.validate(
        minimalRecipe({
          directions: Array.from({ length: 41 }, () => ({ text: "step", image: null })),
        }),
      ),
    ).rejects.toThrow()
  })

  it("rejects negative preparation time", async () => {
    await expect(
      recipeSchema.validate(minimalRecipe({ preparationTimeInMinutes: -1 })),
    ).rejects.toThrow()
  })
})
