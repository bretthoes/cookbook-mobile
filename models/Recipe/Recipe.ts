import { translate } from "@/i18n"
import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { RecipeDirectionModel } from "./RecipeDirection"
import { RecipeImageModel } from "./RecipeImage"
import { IngredientSectionModel } from "./IngredientSection"

/**
 * This represents a recipe.
 */
export const RecipeModel = types
  .model("Recipe")
  .props({
    id: types.identifierNumber,
    title: types.string,
    author: types.maybeNull(types.string),
    authorEmail: types.maybeNull(types.string),
    summary: types.maybeNull(types.string),
    thumbnail: types.maybeNull(types.string),
    videoPath: types.maybeNull(types.string),
    preparationTimeInMinutes: types.maybeNull(types.integer),
    cookingTimeInMinutes: types.maybeNull(types.integer),
    bakingTimeInMinutes: types.maybeNull(types.integer),
    servings: types.maybeNull(types.integer),
    directions: types.optional(types.array(RecipeDirectionModel), []),
    ingredientSections: types.optional(types.array(IngredientSectionModel), []),
    images: types.optional(types.array(RecipeImageModel), []),
    isVegetarian: types.maybeNull(types.boolean),
    isVegan: types.maybeNull(types.boolean),
    isGlutenFree: types.maybeNull(types.boolean),
    isDairyFree: types.maybeNull(types.boolean),
    isCheap: types.maybeNull(types.boolean),
    isHealthy: types.maybeNull(types.boolean),
    isLowFodmap: types.maybeNull(types.boolean),
    isHighProtein: types.maybeNull(types.boolean),
    isBreakfast: types.maybeNull(types.boolean),
    isLunch: types.maybeNull(types.boolean),
    isDinner: types.maybeNull(types.boolean),
    isDessert: types.maybeNull(types.boolean),
    isSnack: types.maybeNull(types.boolean),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    update(updatedRecipe: RecipeSnapshotIn) {
      self.setProp("title", updatedRecipe.title)
      self.setProp("summary", updatedRecipe.summary)
      self.setProp("thumbnail", updatedRecipe.thumbnail)
      self.setProp("videoPath", updatedRecipe.videoPath)
      self.setProp("preparationTimeInMinutes", updatedRecipe.preparationTimeInMinutes)
      self.setProp("cookingTimeInMinutes", updatedRecipe.cookingTimeInMinutes)
      self.setProp("bakingTimeInMinutes", updatedRecipe.bakingTimeInMinutes)
      self.setProp("servings", updatedRecipe.servings)
      self.setProp("directions", updatedRecipe.directions)
      self.setProp("ingredientSections", updatedRecipe.ingredientSections)
      self.setProp("images", updatedRecipe.images)
      self.setProp("isVegetarian", updatedRecipe.isVegetarian)
      self.setProp("isVegan", updatedRecipe.isVegan)
      self.setProp("isGlutenFree", updatedRecipe.isGlutenFree)
      self.setProp("isDairyFree", updatedRecipe.isDairyFree)
      self.setProp("isCheap", updatedRecipe.isCheap)
      self.setProp("isHealthy", updatedRecipe.isHealthy)
      self.setProp("isLowFodmap", updatedRecipe.isLowFodmap)
      self.setProp("isHighProtein", updatedRecipe.isHighProtein)
      self.setProp("isBreakfast", updatedRecipe.isBreakfast)
      self.setProp("isLunch", updatedRecipe.isLunch)
      self.setProp("isDinner", updatedRecipe.isDinner)
      self.setProp("isDessert", updatedRecipe.isDessert)
      self.setProp("isSnack", updatedRecipe.isSnack)
    },
  }))
  .views((recipe) => ({
    get duration() {
      const seconds = Number(recipe.preparationTimeInMinutes)
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = Math.floor((seconds % 3600) % 60)

      const hDisplay = h > 0 ? `${h}:` : ""
      const mDisplay = m > 0 ? `${m}:` : ""
      const sDisplay = s > 0 ? s : ""
      return {
        textLabel: hDisplay + mDisplay + sDisplay,
        accessibilityLabel: translate("demoPodcastListScreen:accessibility.durationLabel", {
          hours: h,
          minutes: m,
          seconds: s,
        }),
      }
    },
  }))

export interface Recipe extends Instance<typeof RecipeModel> {}
export interface RecipeSnapshotOut extends SnapshotOut<typeof RecipeModel> {}
export interface RecipeSnapshotIn extends SnapshotIn<typeof RecipeModel> {}

/**
 * This represents a brief recipe.
 */
export const RecipeBriefModel = types
  .model("RecipeBrief")
  .props({
    id: types.identifierNumber,
    title: types.string,
    isVegetarian: types.maybeNull(types.boolean),
    isVegan: types.maybeNull(types.boolean),
    isGlutenFree: types.maybeNull(types.boolean),
    isDairyFree: types.maybeNull(types.boolean),
    isHealthy: types.maybeNull(types.boolean),
    isCheap: types.maybeNull(types.boolean),
    isLowFodmap: types.maybeNull(types.boolean),
    isHighProtein: types.maybeNull(types.boolean),
    isBreakfast: types.maybeNull(types.boolean),
    isLunch: types.maybeNull(types.boolean),
    isDinner: types.maybeNull(types.boolean),
    isDessert: types.maybeNull(types.boolean),
    isSnack: types.maybeNull(types.boolean),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    update(title: string) {
      self.setProp("title", title)
    },
  }))

export interface RecipeBrief extends Instance<typeof RecipeBriefModel> {}
export interface RecipeBriefSnapshotOut extends SnapshotOut<typeof RecipeBriefModel> {}
export interface RecipeBriefSnapshotIn extends SnapshotIn<typeof RecipeBriefModel> {}
