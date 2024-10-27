import { api } from "app/services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"

/**
 * Model description here for TypeScript hints.
 */
export const InvitationStoreModel = types
  .model("InvitationStore")
  .props({
    inviteEmail: ""
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
    async invite(cookbookId: number) {
      const response = await api.createInvite(cookbookId, self.inviteEmail)
      if (response.kind === "ok") {
        // TODO set success message
      }
      else {
        // set error message from problem details
      }
    }
  }))

export interface InvitationStore extends Instance<typeof InvitationStoreModel> {}
export interface InvitationStoreSnapshotOut extends SnapshotOut<typeof InvitationStoreModel> {}
