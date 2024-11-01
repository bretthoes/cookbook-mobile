import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { MembershipModel } from "./Membership"

/**
 * This represents a list of memberships in a cookbook, along with pagination information.
 */
export const MembershipListModel = types
  .model("MembershipList")
  .props({
    items: types.array(MembershipModel),
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

export interface MembershipList extends Instance<typeof MembershipListModel> {}
export interface MembershipListSnapshotOut extends SnapshotOut<typeof MembershipListModel> {}
export interface MembershipListSnapshotIn extends SnapshotIn<typeof MembershipListModel> {}
