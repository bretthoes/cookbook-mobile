import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { MembershipListModel } from "./MembershipList"
import { Membership, MembershipModel } from "./Membership"

export const MembershipStoreModel = types
  .model("MembershipStore")
  .props({
    memberships: types.optional(MembershipListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
    currentMembership: types.maybeNull(types.reference(MembershipModel))
  })
  .actions(withSetPropAction)
  .views((self) => ({}))
  .actions((self) => ({
    async fetchMemberships() {
      // TODO implement
    },
    setCurrentMembership(membership: Membership) {
      self.currentMembership = membership
    },
    clearCurrentMembership() {
      self.currentMembership = null
    },
  }))

export interface MembershipStore extends Instance<typeof MembershipStoreModel> {}
export interface MembershipStoreSnapshotOut extends SnapshotOut<typeof MembershipStoreModel> {}
export interface MembershipStoreSnapshotIn extends SnapshotIn<typeof MembershipStoreModel> {}
export const createMembershipStoreDefaultModel = () => types.optional(MembershipStoreModel, {})
