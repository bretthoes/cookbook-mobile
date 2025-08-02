import { api } from "src/services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { destroy, flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { InvitationListModel } from "./generics/PaginatedListTypes"

export const InvitationStoreModel = types
  .model("InvitationStore")
  .props({
    invitations: types.optional(InvitationListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    fetch: flow(function* (pageNumber = 1, pageSize = 10) {
      const response = yield api.GetInvitations(pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("invitations", response.invitations)
      } else {
        console.error(`Error fetching invitations: ${JSON.stringify(response)}`)
      }
    }),
    respond: flow(function* (id: number, accepted: boolean) {
      const response = yield api.updateInvite(id, accepted)
      if (response.kind === "ok") {
      const idx = self.invitations.items.findIndex(inv => inv.id === id)
      if (idx >= 0) {
        self.invitations.items.splice(idx, 1)
        self.invitations.totalCount = Math.max(0, self.invitations.totalCount - 1)
      }
      return true
      } else {
        console.error(`Error updating invitations: ${JSON.stringify(response)}`)
        return false
      }
    }),
    invite: flow(function* (cookbookId: number, email: string) {
      const response = yield api.createInvite(cookbookId, email)
      switch (response.kind) {
        case "ok":
          return "Your invite has been sent!"
        case "not-found":
          return "No account exists with that email."
        case "conflict":
          return response.detail ?? "They've already been invited."
        default:
          return "Something went wrong, please try again later."
      }
    }),
  }))

export interface InvitationStore extends Instance<typeof InvitationStoreModel> {}
export interface InvitationStoreSnapshotOut extends SnapshotOut<typeof InvitationStoreModel> {}
