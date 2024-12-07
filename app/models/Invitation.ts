import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Config from "app/config"

/**
 * This represents an invitation to a cookbook from a current member.
 */
export const InvitationModel = types
  .model("Invitation")
  .props({
    id: types.identifierNumber,
    senderName: types.maybeNull(types.string),
    senderEmail: types.maybeNull(types.string),
    cookbookTitle: types.string,
    cookbookImage: types.maybeNull(types.string),
    created: types.string, // TODO parse to date time
  })
  .actions(withSetPropAction)
  .views((invitation) => ({
    get getParsedInvitationMessage() {
      const senderInfo = invitation.senderName || invitation.senderEmail || "Someone";
      const title = invitation.cookbookTitle || "a cookbook";
      const date = new Date(invitation.created)?.toLocaleDateString() || "";
      // TODO i8n below string
      return `${senderInfo} invited you to join "${title}" on ${date}.`;
    },
    get getImage() {
      return invitation.cookbookImage ? `${Config.S3_URL}/${invitation.cookbookImage}` : ""
    },
  }))

export interface Invitation extends Instance<typeof InvitationModel> {}
export interface InvitationSnapshotOut extends SnapshotOut<typeof InvitationModel> {}
export interface InvitationSnapshotIn extends SnapshotIn<typeof InvitationModel> {}


export enum CookbookInvitationStatus {
  Unknown = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3
}
