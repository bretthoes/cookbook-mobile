import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * This represents a user's membership in a cookbook.
 * This is where the cookbook-specific permissions can be accessed.
 */
export const MembershipModel = types
  .model("Membership")
  .props({
    id: types.identifierNumber,
    personId: types.number,
    name: types.string,
    isCreator: types.boolean,
    canAddRecipe: types.boolean,
    canUpdateRecipe: types.boolean,
    canDeleteRecipe: types.boolean,
    canSendInvite: types.boolean,
    canRemoveMember: types.boolean,
    canEditCookbookDetails: types.boolean,
  })
  .actions(withSetPropAction)

export interface Membership extends Instance<typeof MembershipModel> {}
export interface MembershipSnapshotOut extends SnapshotOut<typeof MembershipModel> {}
export interface MembershipSnapshotIn extends SnapshotIn<typeof MembershipModel> {}
