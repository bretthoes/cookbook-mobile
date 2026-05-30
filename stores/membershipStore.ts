import { api } from "@/services/api"
import type { Membership, MembershipSnapshotIn } from "@/types/membership"
import { emptyPaginatedList, type PaginatedList } from "@/types/pagination"
import { create } from "zustand"

export type MembershipProperty = keyof Pick<
  Membership,
  | "isOwner"
  | "canAddRecipe"
  | "canUpdateRecipe"
  | "canDeleteRecipe"
  | "canSendInvite"
  | "canRemoveMember"
  | "canEditCookbookDetails"
>

export interface MembershipState {
  memberships: PaginatedList<Membership>
  ownMembership: Membership | null
  email: string | null

  fetch: (cookbookId: number, pageNumber?: number, pageSize?: number) => Promise<void>
  singleByCookbookId: (id: number) => Promise<boolean>
  fetchEmail: () => Promise<boolean>
  update: (id: number) => Promise<boolean>
  delete: (id: number) => Promise<boolean>
  setEmail: (email: string) => void
  setMembershipProperty: (id: number, property: MembershipProperty, value: boolean) => void
  toggleOwner: (id: number, makeOwner: boolean) => Promise<boolean>
}

export const useMembershipStore = create<MembershipState>((set, get) => ({
  memberships: emptyPaginatedList(),
  ownMembership: null,
  email: null,

  fetch: async (cookbookId, pageNumber = 1, pageSize = 10) => {
    const response = await api.GetMemberships(cookbookId, pageNumber, pageSize)
    if (response.kind === "ok") {
      set({ memberships: response.memberships as PaginatedList<Membership> })
    } else {
      console.error(`Error fetching memberships: ${JSON.stringify(response)}`)
    }
  },

  singleByCookbookId: async (id) => {
    const response = await api.getMembership(id)
    if (response.kind === "ok") {
      set({ ownMembership: response.membership as Membership })
      return true
    }
    console.error(`Error fetching membership: ${JSON.stringify(response)}`)
    return false
  },

  fetchEmail: async () => {
    if (get().email) return true
    const response = await api.getEmail()
    if (response.kind === "ok") {
      set({ email: response.email })
      return true
    }
    console.error(`Error fetching email: ${JSON.stringify(response)}`)
    return false
  },

  update: async (id) => {
    const membership = get().memberships.items.find((m) => m.id === id)
    if (!membership) return false
    const response = await api.updateMembership(id, membership as MembershipSnapshotIn)
    if (response.kind === "ok") return true
    console.error(`Error updating membership: ${JSON.stringify(response)}`)
    return false
  },

  delete: async (id) => {
    const response = await api.deleteMembership(id)
    if (response.kind === "ok") {
      const memberships = get().memberships
      set({
        memberships: {
          ...memberships,
          items: memberships.items.filter((item) => item.id !== id),
          totalCount: Math.max(0, memberships.totalCount - 1),
        },
      })
      return true
    }
    console.error(`Error deleting membership: ${JSON.stringify(response)}`)
    return false
  },

  setEmail: (email) => set({ email }),

  setMembershipProperty: (id, property, value) => {
    set({
      memberships: {
        ...get().memberships,
        items: get().memberships.items.map((m) => (m.id === id ? { ...m, [property]: value } : m)),
      },
    })
  },

  toggleOwner: async (id, makeOwner) => {
    const membership = get().memberships.items.find((m) => m.id === id)
    if (!membership) return false

    get().setMembershipProperty(id, "isOwner", makeOwner)
    const updated = get().memberships.items.find((m) => m.id === id)!
    const response = await api.updateMembership(id, updated as MembershipSnapshotIn)
    if (response.kind === "ok") return true

    console.error(`Error updating membership ownership: ${JSON.stringify(response)}`)
    get().setMembershipProperty(id, "isOwner", !makeOwner)
    return false
  },
}))
