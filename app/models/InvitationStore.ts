import { api } from "app/services/api"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { InvitationListModel } from "./generics/PaginatedList"

export const InvitationStoreModel = types
  .model("InvitationStore")
  .props({
    invitations: types.maybeNull(InvitationListModel),
    inviteEmail: "",
    result: ""
  })
  .views((self) => ({
    get validationError() {
      if (self.inviteEmail.length === 0) return "can't be blank"
      if (self.inviteEmail.length < 6) return "must be at least 6 characters"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(self.inviteEmail))
        return "must be a valid email address"
      return ""
    },
  }))
  .actions(withSetPropAction)
  .actions((self) => ({
    setInviteEmail(value: string) {
      self.inviteEmail = value
    },
    setResult(value: string) {
      self.result = value
    },
    async fetchInvitations(pageNumber = 1, pageSize = 10){
      console.debug('fetching invitations...')
      const response = await api.GetInvitations(pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("invitations", response.invitations)
      } else {
        console.error(`Error fetching invitations: ${JSON.stringify(response)}`)
      }
    },
    async respond(invitationId: number, accepted: boolean) {
      const response = await api.updateInvite(invitationId, accepted)
      console.debug(JSON.stringify(response, null, 2))
      if (response.kind === "ok"){
        await this.fetchInvitations()
      } else {
        console.error(`Error updating invitations: ${JSON.stringify(response)}`)
      }
    },
    // respond: flow(function* (id: number, accepted: boolean){
    //   const response = yield api.updateInvite(id, accepted)
    //   console.debug(JSON.stringify(response, null, 2))
    //   if (response.kind === "ok"){
    //     self.invitations.items = self.invitations?.items.filter(i => i.id !== id)
    //   } else {
    //     console.error(`Error updating invitations: ${JSON.stringify(response)}`)
    //   }
    // }),
    async invite(cookbookId: number) {
      this.setResult("")
      const response = await api.createInvite(cookbookId, self.inviteEmail)
      console.debug(JSON.stringify(response, null, 2))
      switch (response.kind) {
        case "ok":
          this.setResult("Your invite has been sent!")
          this.setInviteEmail("")
          break
        case "not-found":
          this.setResult("No account exists with that email.")
          break
        case "conflict":
          this.setResult(response.detail ?? "They've already been invited.")
          break
        default:
          this.setResult("Something went wrong, please try again later.")
      }
    }
  }))

export interface InvitationStore extends Instance<typeof InvitationStoreModel> {}
export interface InvitationStoreSnapshotOut extends SnapshotOut<typeof InvitationStoreModel> {}
