import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree";
import { withSetPropAction } from "./helpers/withSetPropAction";

/**
 * This represents pagination details for a list.
 */
export const PaginationModel = types
  .model("Pagination")
  .props({
    pageNumber: types.optional(types.number, 1),
    totalPages: types.optional(types.number, 1),
    totalCount: types.optional(types.number, 0),
    hasPreviousPage: types.optional(types.boolean, false),
    hasNextPage: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)

export interface Pagination extends Instance<typeof PaginationModel> {}
export interface PaginationSnapshotOut extends SnapshotOut<typeof PaginationModel> {}
export interface PaginationSnapshotIn extends SnapshotIn<typeof PaginationModel> {}

