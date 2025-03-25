import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { Membership, MembershipModel } from "./Membership"
import { api } from "src/services/api"
import { MembershipListModel } from "./generics/PaginatedListTypes"

export const MembershipStoreModel = types
  .model("MembershipStore")
  .props({
    memberships: types.optional(MembershipListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
    currentMembership: types.maybeNull(MembershipModel),
    ownMembership: types.maybeNull(MembershipModel),
    email: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .actions((self) => {
    const actions = {
      async fetch(cookbookId: number, pageNumber = 1, pageSize = 10) {
        self.currentMembership = null
        const response = await api.GetMemberships(cookbookId, pageNumber, pageSize)
        if (response.kind == "ok") {
          self.setProp("memberships", response.memberships)
        } else {
          console.error(`Error fetching memberships: ${JSON.stringify(response)}`)
        }
      },
      async single(id: number) {
        const response = await api.getMembership(id)
        if (response.kind == "ok") {
          self.setProp("currentMembership", response.membership)
        } else {
          console.error(`Error fetching membership: ${JSON.stringify(response)}`)
        }
      },
      setCurrentMembership(membership: Membership) {
        self.currentMembership = membership
      },
      clearCurrentMembership() {
        self.currentMembership = null
      },
      async fetchEmail() {
        if (self.email) return
        const response = await api.getEmail()
        if (response.kind === "ok") self.setProp("email", response.email)
        else console.error(`Error fetching email: ${JSON.stringify(response)}`)
      },
      async updateMembership(id: number) {
        const membership = self.currentMembership
        if (!membership) return

        const response = await api.updateMembership(id, membership)
        if (response.kind === "ok") {
          // Refresh the memberships list
          await actions.fetch(id)
        } else {
          console.error(`Error updating membership: ${JSON.stringify(response)}`)
        }
      },
      async deleteMembership(id: number) {
        const response = await api.deleteMembership(id)
        if (response.kind === "ok") {
          // Remove the membership from the list
          await actions.fetch(id)
          self.currentMembership = null
        } else {
          console.error(`Error deleting membership: ${JSON.stringify(response)}`)
        }
      },
      setMembershipProperty(id: number, property: keyof typeof MembershipModel.properties, value: boolean) {
        const membership = self.currentMembership
        if (!membership) return

        membership.setProp(property, value)
        self.currentMembership = membership
      },
    }
    return actions
  })

export interface MembershipStore extends Instance<typeof MembershipStoreModel> {}
export interface MembershipStoreSnapshotOut extends SnapshotOut<typeof MembershipStoreModel> {}
export interface MembershipStoreSnapshotIn extends SnapshotIn<typeof MembershipStoreModel> {}
