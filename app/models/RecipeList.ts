import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { RecipeBriefModel } from "./Recipe"

/**
 * This represents a list of recipes, along with pagination information.
 */
export const RecipeListModel = types
  .model("RecipeList")
  .props({
    items: types.array(RecipeBriefModel),
    pageNumber: types.integer,
    totalPages: types.integer,
    totalCount: types.integer,
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get hasMultiplePages() {
      return self.totalPages > 1
    },
    get hasNextPage() {
      return self.pageNumber < self.totalPages
    },
    get hasPreviousPage() {
      return self.pageNumber > 1
    },
  }))

export interface RecipeList extends Instance<typeof RecipeListModel> {}
export interface RecipeListSnapshotOut extends SnapshotOut<typeof RecipeListModel> {}
export interface RecipeListSnapshotIn extends SnapshotIn<typeof RecipeListModel> {}
