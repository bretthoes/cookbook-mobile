import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";
import Config from "app/config";

/**
 * This represents an image in a recipe.
 */
export const RecipeImageModel = types
  .model("RecipeImage")
  .props({
    id: types.integer,
    name: types.string,
    ordinal: types.integer,
  })
  .actions(withSetPropAction)
  .views((image) => ({
    get getImage() {
      return image.name ? `${Config.S3_URL}/${image.name}` : ""
    },
  }))

export interface RecipeImage extends Instance<typeof RecipeImageModel> {}
export interface RecipeImageSnapshotOut extends SnapshotOut<typeof RecipeImageModel> {}
export interface RecipeImageSnapshotIn extends SnapshotIn<typeof RecipeImageModel> {}
