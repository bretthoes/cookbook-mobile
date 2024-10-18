import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { RecipeDirectionModel } from "./RecipeDirection"
import { RecipeImageModel } from "./RecipeImage"
import { RecipeIngredientModel } from "./RecipeIngredient"

/**
 * This represents a recipe.
 */
export const RecipeModel = types
  .model("Recipe")
  .props({
    id: types.identifierNumber,
    title: types.string,
    authorId: types.maybeNull(types.integer),
    author: types.maybeNull(types.string),
    summary: types.maybeNull(types.string),
    thumbnail: types.maybeNull(types.string),
    videoPath: types.maybeNull(types.string),
    preparationTimeInMinutes: types.maybeNull(types.integer),
    cookingTimeInMinutes: types.maybeNull(types.integer),
    bakingTimeInMinutes: types.maybeNull(types.integer),
    servings: types.maybeNull(types.integer),
    directions: types.array(RecipeDirectionModel) ?? [],
    ingredients: types.array(RecipeIngredientModel) ?? [],
    images: types.array(RecipeImageModel) ?? [],
  })
  .actions(withSetPropAction)
  .views((recipe) => ({
    get parsedTitleAndSubtitle() {
      const defaultValue = { title: recipe.title?.trim() }

      if (!defaultValue.title) return defaultValue

      const titleMatches = defaultValue.title.match(/^(RNR.*\d)(?: - )(.*$)/)

      if (!titleMatches || titleMatches.length !== 3) return defaultValue

      return { title: titleMatches[1], subtitle: titleMatches[2] }
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
  })
  .actions(withSetPropAction)
  .views((recipe) => ({
    get parsedTitleAndSubtitle() {
      const defaultValue = { title: recipe.title?.trim() }

      if (!defaultValue.title) return defaultValue

      const titleMatches = defaultValue.title.match(/^(RNR.*\d)(?: - )(.*$)/)

      if (!titleMatches || titleMatches.length !== 3) return defaultValue

      return { title: titleMatches[1], subtitle: titleMatches[2] }
    },
  }))

export interface RecipeBrief extends Instance<typeof RecipeBriefModel> {}
export interface RecipeBriefSnapshotOut extends SnapshotOut<typeof RecipeBriefModel> {}
export interface RecipeBriefSnapshotIn extends SnapshotIn<typeof RecipeBriefModel> {}

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
  })
  .actions(withSetPropAction)

export interface RecipeToAdd extends Instance<typeof RecipeToAddModel> {}
export interface RecipeToAddSnapshotOut extends SnapshotOut<typeof RecipeToAddModel> {}
export interface RecipeToAddSnapshotIn extends SnapshotIn<typeof RecipeToAddModel> {}
