import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { InvitationModel } from "./Invitation"

/**
 * This represents a list of invitations to a cookbook, along with pagination details.
 */
export const InvitationListModel = types
  .model("InvitationList")
  .props({
    items: types.array(InvitationModel),
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

export interface InvitationList extends Instance<typeof InvitationListModel> {}
export interface InvitationListSnapshotOut extends SnapshotOut<typeof InvitationListModel> {}
export interface InvitationListSnapshotIn extends SnapshotIn<typeof InvitationListModel> {}
