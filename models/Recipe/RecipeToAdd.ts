import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { RecipeDirectionModel } from "./RecipeDirection"
import { RecipeImageModel } from "./RecipeImage"
import { RecipeIngredientModel } from "./RecipeIngredient"

/**
 * This represents a recipe to be added.
 */
export const RecipeToAddModel = types
  .model("RecipeToAdd")
  .props({
    title: types.string,
    cookbookId: types.number,
    summary: types.maybeNull(types.string),
    thumbnail: types.maybeNull(types.string),
    videoPath: types.maybeNull(types.string),
    preparationTimeInMinutes: types.maybeNull(types.integer),
    cookingTimeInMinutes: types.maybeNull(types.integer),
    bakingTimeInMinutes: types.maybeNull(types.integer),
    servings: types.maybeNull(types.integer),
    directions: types.array(RecipeDirectionModel) ?? [],
    images: types.array(RecipeImageModel) ?? [],
    ingredients: types.array(RecipeIngredientModel) ?? [],
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

export interface RecipeToAdd extends Instance<typeof RecipeToAddModel> {}
export interface RecipeToAddSnapshotOut extends SnapshotOut<typeof RecipeToAddModel> {}
export interface RecipeToAddSnapshotIn extends SnapshotIn<typeof RecipeToAddModel> {}
