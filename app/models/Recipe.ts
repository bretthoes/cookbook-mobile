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
    id: types.integer,
    title: types.string,
    authorId: types.integer,
    author: types.string,
    summary: types.maybeNull(types.string),
    thumbnail: types.maybeNull(types.string),
    videoPath: types.maybeNull(types.string),
    preparationTimeInMinutes: types.maybeNull(types.integer),
    cookingTimeInMinutes: types.maybeNull(types.integer),
    bakingTimeInMinutes: types.maybeNull(types.integer),
    servings: types.maybeNull(types.integer),
    directions: types.optional(types.array(RecipeDirectionModel), []),
    ingredients: types.optional(types.array(RecipeIngredientModel), []),
    images: types.optional(types.array(RecipeImageModel), []),
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
