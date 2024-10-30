import { api } from "app/services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const InvitationStoreModel = types
  .model("InvitationStore")
  .props({
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
  .actions((self) => ({
    setInviteEmail(value: string) {
      self.inviteEmail = value
    },
    setResult(value: string) {
      self.result = value
    },
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
