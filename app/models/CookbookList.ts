import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { CookbookModel } from "./Cookbook"

/**
 * This represents a list of cookbooks, along with pagination information.
 */
export const CookbookListModel = types
  .model("CookbookList")
  .props({
    items: types.array(CookbookModel),
    pageNumber: types.integer,
    totalPages: types.integer,
    totalCount: types.integer,
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get hasMorePages() {
      return self.totalPages > 1
    },
    get hasNextPage() {
      return self.pageNumber < self.totalPages
    },
    get hasPreviousPage() {
      return self.pageNumber > 1
    },
  }))

export interface CookbookList extends Instance<typeof CookbookListModel> {}
export interface CookbookListSnapshotOut extends SnapshotOut<typeof CookbookListModel> {}
export interface CookbookListSnapshotIn extends SnapshotIn<typeof CookbookListModel> {}
