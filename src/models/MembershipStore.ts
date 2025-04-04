import { flow, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
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
    ownMembership: types.maybeNull(MembershipModel),
    email: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
      fetch: flow(function* (cookbookId: number, pageNumber = 1, pageSize = 10) {
        const response = yield api.GetMemberships(cookbookId, pageNumber, pageSize)
        if (response.kind == "ok") {
          self.setProp("memberships", response.memberships)
        } else {
          console.error(`Error fetching memberships: ${JSON.stringify(response)}`)
        }
      }),
      single: flow(function* (id: number) {
        const response = yield api.getMembership(id)
        if (response.kind == "ok") {
          self.setProp("ownMembership", response.membership)
          return true
        } else {
          console.error(`Error fetching membership: ${JSON.stringify(response)}`)
          return false
        }
      }),
      fetchEmail: flow(function* () {
        if (self.email) return
        const response = yield api.getEmail()
        if (response.kind === "ok") {
          self.setProp("email", response.email)
          return true
        } else {
          console.error(`Error fetching email: ${JSON.stringify(response)}`)
          return false
        }
      }),
      update: flow(function* (id: number) {
        const membership = self.memberships.items.find(m => m.id === id)
        if (!membership) return false
        const response = yield api.updateMembership(id, membership)
        if (response.kind === "ok") {
          return true
        } else {
          console.error(`Error updating membership: ${JSON.stringify(response)}`)
          return false
        }
      }),
      delete: flow(function* (id: number) {
        const response = yield api.deleteMembership(id)
        if (response.kind === "ok") {
          console.log("Membership deleted", response)
          self.setProp("memberships", {
            ...self.memberships,
            items: self.memberships.items.filter(item => item.id !== id)
          })
          return true
        } else {
          console.error(`Error deleting membership: ${JSON.stringify(response)}`)
          return false
        }
      }),
      setMembershipProperty(id: number, property: keyof typeof MembershipModel.properties, value: boolean) {
        const membership = self.memberships.items.find(m => m.id === id)
        if (!membership) return

        membership.setProp(property, value)
      },
  }))

export interface MembershipStore extends Instance<typeof MembershipStoreModel> {}
export interface MembershipStoreSnapshotOut extends SnapshotOut<typeof MembershipStoreModel> {}
export interface MembershipStoreSnapshotIn extends SnapshotIn<typeof MembershipStoreModel> {}
