import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Membership, MembershipModel } from "./Membership"
import { api } from "app/services/api"
import { MembershipListModel } from "./generics/PaginatedList"

export const MembershipStoreModel = types
  .model("MembershipStore")
  .props({
    memberships: types.maybeNull(MembershipListModel),
    currentMembership: types.maybeNull(types.reference(MembershipModel))
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    async fetchMemberships(cookbookId: number, pageNumber = 1, pageSize = 10) {
      this.clearCurrentMembership()
      const response = await api.GetMemberships(cookbookId, pageNumber, pageSize)
      if (response.kind == "ok") {
        self.setProp("memberships", response.memberships)
      } else {
        console.error(`Error fetching memberships: ${JSON.stringify(response)}`)
      }
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