import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";

/**
 * This represents an ingredient in a recipe.
 */
export const RecipeIngredientModel = types
  .model("RecipeIngredient")
  .props({
    id: types.integer,
    name: types.string,
    optional: types.boolean,
    ordinal: types.integer
  })
  .actions(withSetPropAction)

export interface RecipeIngredient extends Instance<typeof RecipeIngredientModel> {}
export interface RecipeIngredientSnapshotOut extends SnapshotOut<typeof RecipeIngredientModel> {}
export interface RecipeIngredientSnapshotIn extends SnapshotIn<typeof RecipeIngredientModel> {}
