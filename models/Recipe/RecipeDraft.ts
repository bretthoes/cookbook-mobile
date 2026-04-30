import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { RecipeDirectionModel } from "./RecipeDirection"
import { RecipeImageModel } from "./RecipeImage"
import { IngredientSectionModel } from "./IngredientSection"

/**
 * Represents an in-progress recipe form saved as a draft.
 * One draft per cookbook, keyed by cookbookId.
 * draftId is a unique string identifier for the MST node.
 */
export const RecipeDraftModel = types
  .model("RecipeDraft")
  .props({
    draftId: types.identifier,
    cookbookId: types.number,
    savedAt: types.Date,
    title: types.string,
    summary: types.maybeNull(types.string),
    thumbnail: types.maybeNull(types.string),
    videoPath: types.maybeNull(types.string),
    preparationTimeInMinutes: types.maybeNull(types.integer),
    cookingTimeInMinutes: types.maybeNull(types.integer),
    bakingTimeInMinutes: types.maybeNull(types.integer),
    servings: types.maybeNull(types.integer),
    directions: types.array(RecipeDirectionModel),
    images: types.array(RecipeImageModel),
    ingredientSections: types.array(IngredientSectionModel),
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

export interface RecipeDraft extends Instance<typeof RecipeDraftModel> {}
export interface RecipeDraftSnapshotOut extends SnapshotOut<typeof RecipeDraftModel> {}
export interface RecipeDraftSnapshotIn extends SnapshotIn<typeof RecipeDraftModel> {}
