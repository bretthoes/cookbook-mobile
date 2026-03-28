import { api } from "@/services/api"
import { destroy, flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { Recipe, RecipeBriefModel, RecipeModel, RecipeSnapshotIn } from "./Recipe"
import { RecipeDraftModel } from "./RecipeDraft"
import { RecipeToAddModel, RecipeToAddSnapshotIn } from "./RecipeToAdd"

import { withSetPropAction } from "../helpers/withSetPropAction"

export const WEEKLY_IMPORT_LIMIT = 5

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

/** Minimal form shape accepted by saveDraft — mirrors RecipeFormInputs from RecipeForm */
export interface DraftFormData {
  title: string
  summary?: string | null
  preparationTimeInMinutes?: number | null
  cookingTimeInMinutes?: number | null
  bakingTimeInMinutes?: number | null
  servings?: number | null
  ingredients: { name: string; optional: boolean | null }[]
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

function makeDraftId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const RecipeStoreModel = types
  .model("RecipeStore")
  .props({
    recipes: types.array(RecipeBriefModel),
    selected: types.maybeNull(RecipeModel),
    recipeToAdd: types.maybeNull(RecipeToAddModel),
    weeklyImportCount: types.optional(types.number, 0),
    weeklyImportWeekStart: types.optional(types.string, ""),
    drafts: types.array(RecipeDraftModel),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    clear() {
      self.recipes.clear()
    },
    create: flow(function* (recipeToAdd: RecipeToAddSnapshotIn) {
      const response = yield api.createRecipe(recipeToAdd)
      if (response.kind === "ok") {
        if (self.selected) {
          destroy(self.selected)
        }
        self.selected = null
        const newRecipe = RecipeModel.create({
          id: response.recipeId,
          title: recipeToAdd.title,
          summary: recipeToAdd.summary,
          thumbnail: recipeToAdd.thumbnail,
          videoPath: recipeToAdd.videoPath,
          preparationTimeInMinutes: recipeToAdd.preparationTimeInMinutes,
          cookingTimeInMinutes: recipeToAdd.cookingTimeInMinutes,
          bakingTimeInMinutes: recipeToAdd.bakingTimeInMinutes,
          servings: recipeToAdd.servings,
          directions: recipeToAdd.directions,
          ingredients: recipeToAdd.ingredients,
          images: recipeToAdd.images,
        })
        self.recipes.push(
          RecipeBriefModel.create({ id: response.recipeId, title: recipeToAdd.title }),
        )
        self.selected = newRecipe
        return true
      }
      console.error(`Error creating recipe: ${JSON.stringify(response)}`)
      return false
    }),
    single: flow(function* (id: number) {
      if (self.selected) {
        destroy(self.selected)
      }
      self.setProp("selected", null)
      self.selected = null
      const response = yield api.getRecipe(id)
      if (response.kind === "ok") {
        self.setProp("selected", response.recipe)
        return true
      }
      console.error(`Error fetching recipe: ${JSON.stringify(response)}`)
      return false
    }),
    fetch: flow(function* (cookbookId: number, search = "", pageNumber = 1, pageSize = 999) {
      const response = yield api.getRecipes(cookbookId, search, pageNumber, pageSize)
      if (response.kind === "ok") {
        self.recipes.replace(response.recipes.items)
        return true
      }
      console.error(`Error fetching recipes: ${JSON.stringify(response)}`)
      return false
    }),
    update: flow(function* (updatedRecipe: RecipeSnapshotIn) {
      const response = yield api.updateRecipe(updatedRecipe)
      if (response.kind === "ok") {
        if (self.selected) self.selected.update(updatedRecipe)
        else console.error(`Error updating recipe: ${JSON.stringify(response)}`)
        var brief = self.recipes.find((recipe) => recipe.id === updatedRecipe.id)
        brief?.update(updatedRecipe.title)

        return true
      }
      console.error(`Error updating recipe: ${JSON.stringify(response)}`)
      return false
    }),
    delete: flow(function* () {
      if (!self.selected) return
      const response = yield api.deleteRecipe(self.selected.id)
      if (response.kind === "ok") {
        destroy(self.selected)
        self.setProp("selected", null)
        // TODO remove from list?
        return true
      }
      console.error(`Error deleting recipe: ${JSON.stringify(response)}`)
      return false
    }),
    remove() {
      destroy(self.selected)
      self.setProp("selected", null)
    },
    getById(id: number) {
      return self.recipes.find((recipe) => recipe.id === id)
    },
    setRecipeToAdd(recipeToAddSnapshot: RecipeToAddSnapshotIn) {
      const recipeToAddInstance = RecipeToAddModel.create(recipeToAddSnapshot)
      self.setProp("recipeToAdd", recipeToAddInstance)
    },
    clearRecipeToAdd() {
      self.recipeToAdd = null
    },
    setselected(recipe: Recipe) {
      self.selected = recipe
    },
    clearselected() {
      self.selected = null
    },
    incrementImportCount() {
      const currentWeek = getCurrentWeekKey()
      if (self.weeklyImportWeekStart !== currentWeek) {
        self.weeklyImportCount = 0
        self.weeklyImportWeekStart = currentWeek
      }
      self.weeklyImportCount += 1
    },
    saveDraft(cookbookId: number, formData: DraftFormData) {
      const existing = self.drafts.find((d) => d.cookbookId === cookbookId)
      const validIngredients = formData.ingredients
        .filter((i) => i.name?.trim())
        .map((i, idx) => ({ id: 0, name: i.name.trim(), optional: i.optional ?? false, ordinal: idx + 1 }))
      const validDirections = formData.directions
        .filter((d) => d.text?.trim())
        .map((d, idx) => ({ id: 0, text: d.text.trim(), ordinal: idx + 1, image: d.image ?? null }))
      const validImages = formData.images
        .filter((img) => img?.trim())
        .map((img, idx) => ({ id: 0, name: img.trim(), ordinal: idx + 1 }))

      if (existing) {
        existing.setProp("savedAt", new Date())
        existing.setProp("title", formData.title)
        existing.setProp("summary", formData.summary ?? null)
        existing.setProp("preparationTimeInMinutes", formData.preparationTimeInMinutes ?? null)
        existing.setProp("cookingTimeInMinutes", formData.cookingTimeInMinutes ?? null)
        existing.setProp("bakingTimeInMinutes", formData.bakingTimeInMinutes ?? null)
        existing.setProp("servings", formData.servings ?? null)
        existing.setProp("ingredients", validIngredients)
        existing.setProp("directions", validDirections)
        existing.setProp("images", validImages)
        existing.setProp("isVegetarian", formData.isVegetarian ?? null)
        existing.setProp("isVegan", formData.isVegan ?? null)
        existing.setProp("isGlutenFree", formData.isGlutenFree ?? null)
        existing.setProp("isDairyFree", formData.isDairyFree ?? null)
        existing.setProp("isCheap", formData.isCheap ?? null)
        existing.setProp("isHealthy", formData.isHealthy ?? null)
        existing.setProp("isLowFodmap", formData.isLowFodmap ?? null)
        existing.setProp("isHighProtein", formData.isHighProtein ?? null)
        existing.setProp("isBreakfast", formData.isBreakfast ?? null)
        existing.setProp("isLunch", formData.isLunch ?? null)
        existing.setProp("isDinner", formData.isDinner ?? null)
        existing.setProp("isDessert", formData.isDessert ?? null)
        existing.setProp("isSnack", formData.isSnack ?? null)
      } else {
        self.drafts.push(
          RecipeDraftModel.create({
            draftId: makeDraftId(),
            cookbookId,
            savedAt: new Date(),
            title: formData.title,
            summary: formData.summary ?? null,
            thumbnail: null,
            videoPath: null,
            preparationTimeInMinutes: formData.preparationTimeInMinutes ?? null,
            cookingTimeInMinutes: formData.cookingTimeInMinutes ?? null,
            bakingTimeInMinutes: formData.bakingTimeInMinutes ?? null,
            servings: formData.servings ?? null,
            ingredients: validIngredients,
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
          }),
        )
      }
    },
    deleteDraft(cookbookId: number) {
      const idx = self.drafts.findIndex((d) => d.cookbookId === cookbookId)
      if (idx !== -1) self.drafts.splice(idx, 1)
    },
  }))
  .views((self) => ({
    getDraftForCookbook(cookbookId: number) {
      return self.drafts.find((d) => d.cookbookId === cookbookId)
    },
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
