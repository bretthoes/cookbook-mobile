import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { parseISO } from "date-fns/parseISO"

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
    created: types.string,
  })
  .actions(withSetPropAction)
  .views((invitation) => ({
    get getSenderInfo() {
      return `From: ${invitation.senderEmail}`
    },
    get getTimeAgo() {
      return formatDistanceToNow(parseISO(invitation.created), { addSuffix: true })
    },
    get getParsedInvitationMessage() {
      const title = invitation.cookbookTitle || "a cookbook"
      const senderInfo = invitation.senderName?.trim()
      return senderInfo
        ? `${senderInfo} invited you to join "${title}".`
        : `You have been invited to join "${title}".`
    },
  }))

export interface Invitation extends Instance<typeof InvitationModel> {}
export interface InvitationSnapshotOut extends SnapshotOut<typeof InvitationModel> {}
export interface InvitationSnapshotIn extends SnapshotIn<typeof InvitationModel> {}

export enum CookbookInvitationStatus {
  Error = 0,
  Active = 1,
  Accepted = 2,
  Rejected = 3,
  Revoked = 4,
}
