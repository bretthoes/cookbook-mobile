import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { RecipeIngredientModel } from "./RecipeIngredient"

/**
 * A titled group of ingredients within a recipe (e.g. "For the sauce").
 */
export const IngredientSectionModel = types
  .model("IngredientSection")
  .props({
    id: types.optional(types.number, 0),
    title: types.string,
    ordinal: types.integer,
    ingredients: types.optional(types.array(RecipeIngredientModel), []),
  })
  .actions(withSetPropAction)

export interface IngredientSection extends Instance<typeof IngredientSectionModel> {}
export interface IngredientSectionSnapshotOut extends SnapshotOut<typeof IngredientSectionModel> {}
export interface IngredientSectionSnapshotIn extends SnapshotIn<typeof IngredientSectionModel> {}
