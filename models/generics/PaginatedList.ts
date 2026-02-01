import { IAnyModelType, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

/**
 * A generic model representing a paginated list.
 */
export const PaginatedListModel = <T extends IAnyModelType>(itemModel: T) =>
  types
    .model("PaginatedList")
    .props({
      items: types.array(itemModel) ?? [],
      pageNumber: types.integer ?? 1,
      totalPages: types.integer ?? 1,
      totalCount: types.integer ?? 0,
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
