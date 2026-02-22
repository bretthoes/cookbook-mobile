import { api } from "@/services/api"
import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { InvitationListModel } from "./generics/PaginatedListTypes"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { InvitationModel } from "./Invitation"

export const InvitationStoreModel = types
  .model("InvitationStore")
  .props({
    invitation: types.maybeNull(InvitationModel),
    invitations: types.optional(InvitationListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    single: flow(function* (token: string) {
      const response = yield api.GetInvitationToken(token)
      if (response.kind === "ok") {
        self.setProp("invitation", response.invitation)
      } else {
        console.error(`Error fetching invitation: ${JSON.stringify(response)}`)
      }
    }),
    fetch: flow(function* (pageNumber = 1, pageSize = 10) {
      const response = yield api.GetInvitations(pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("invitations", response.invitations)
      } else {
        console.error(`Error fetching invitations: ${JSON.stringify(response)}`)
      }
    }),
    count: flow(function* () {
      const response = yield api.GetInvitationCount()
      if (response.kind === "ok") {
        self.setProp("invitations", response.invitations.totalCount)
      } else {
        console.error(`Error fetching invitations: ${JSON.stringify(response)}`)
      }
    }),
    respond: flow(function* (idOrToken: number | string, accepted: boolean) {
      let response
      if (typeof idOrToken === "string") {
        response = yield api.UpdateInvitationToken(idOrToken, accepted)
      } else {
        response = yield api.updateInvite(idOrToken, accepted)
      }

      if (response.kind === "ok") {
        if (typeof idOrToken === "number") {
          const idx = self.invitations.items.findIndex((inv) => inv.id === idOrToken)
          if (idx >= 0) {
            self.invitations.items.splice(idx, 1)
            self.invitations.totalCount = Math.max(0, self.invitations.totalCount - 1)
          }
        }
        return true
      } else {
        console.error(`Error updating invitations: ${JSON.stringify(response)}`)
        return { success: false, conflict: response.kind === "conflict" }
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
          return "They've already been invited."
        default:
          return "Something went wrong, please try again later."
      }
    }),
    link: flow(function* (cookbookId: number) {
      const response = yield api.createInviteToken(cookbookId)
      if (response.kind === "ok") return { token: response.token }
      return { message: "Error creating link." }
    }),
  }))

export interface InvitationStore extends Instance<typeof InvitationStoreModel> {}
export interface InvitationStoreSnapshotOut extends SnapshotOut<typeof InvitationStoreModel> {}
