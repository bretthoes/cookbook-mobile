import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * This represents an invitation to a cookbook from a current member.
 */
export const InvitationModel = types
  .model("Invitation")
  .props({
    id: types.identifierNumber,
    cookbookId: types.number,
    senderPersonId: types.maybeNull(types.number),
    recipientPersonId: types.maybeNull(types.number),
    invitationStatus: types.number,
    responseDate: types.maybeNull(types.Date)
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get statusText(): string {
      const statusMap: { [key: number]: string } = {
        [CookbookInvitationStatus.Unknown]: "Unknown",
        [CookbookInvitationStatus.Sent]: "Sent",
        [CookbookInvitationStatus.Accepted]: "Accepted",
        [CookbookInvitationStatus.Rejected]: "Rejected",
      }
      return statusMap[self.invitationStatus] || "Unknown"
    }
  }))
  .actions((self) => ({}))

export interface Invitation extends Instance<typeof InvitationModel> {}
export interface InvitationSnapshotOut extends SnapshotOut<typeof InvitationModel> {}
export interface InvitationSnapshotIn extends SnapshotIn<typeof InvitationModel> {}


export enum CookbookInvitationStatus {
  Unknown = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3
}

/**
 * This represents a recipe to be added.
 */
export const InvitationToAddModel = types
  .model("InvitationToAdd")
  .props({
    cookbookId: types.number,
    recipientEmail: types.string,
  })
  .actions(withSetPropAction)

export interface InvitationToAdd extends Instance<typeof InvitationToAddModel> {}
export interface InvitationToAddSnapshotOut extends SnapshotOut<typeof InvitationToAddModel> {}
export interface InvitationToAddSnapshotIn extends SnapshotIn<typeof InvitationToAddModel> {}

