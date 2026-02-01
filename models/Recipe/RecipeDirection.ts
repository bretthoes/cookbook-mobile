import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

/**
 * This represents a direction or instruction in a recipe.
 */
export const RecipeDirectionModel = types
  .model("RecipeDirection")
  .props({
    id: 0,
    text: types.string,
    ordinal: types.integer,
    image: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)

export interface RecipeDirection extends Instance<typeof RecipeDirectionModel> {}
export interface RecipeDirectionSnapshotOut extends SnapshotOut<typeof RecipeDirectionModel> {}
export interface RecipeDirectionSnapshotIn extends SnapshotIn<typeof RecipeDirectionModel> {}
