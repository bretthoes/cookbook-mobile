import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

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

export interface Invitation extends Instance<typeof InvitationModel> {}
export interface InvitationSnapshotOut extends SnapshotOut<typeof InvitationModel> {}
export interface InvitationSnapshotIn extends SnapshotIn<typeof InvitationModel> {}


export enum CookbookInvitationStatus {
  Unknown = 0,
  Sent = 1,
  Accepted = 2,
  Rejected = 3
}
