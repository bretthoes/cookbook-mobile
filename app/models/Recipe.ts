import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * This represents a recipe.
 */
export const RecipeModel = types
  .model("Recipe")
  .props({
    id: types.integer,
    title: "",
    imagePath: ""
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
