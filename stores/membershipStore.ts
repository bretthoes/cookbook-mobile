import { api } from "@/services/api"
import type { Membership, MembershipTier } from "@/types/membership"
import { emptyPaginatedList, type PaginatedList } from "@/types/pagination"
import { isOwnerTier, MEMBERSHIP_TIER } from "@/utils/membershipTier"
import { create } from "zustand"

export interface MembershipState {
  memberships: PaginatedList<Membership>
  /** Cookbook the `memberships` list was loaded for. Null until the first response. */
  membershipsCookbookId: string | null
  ownMembership: Membership | null
  loadedCookbookId: string | null
  email: string | null

  loadForCookbook: (
    cookbookId: string,
    pageNumber?: number,
    pageSize?: number,
    force?: boolean,
  ) => Promise<void>
  fetch: (cookbookId: string, pageNumber?: number, pageSize?: number) => Promise<void>
  singleByCookbookId: (cookbookId: string, force?: boolean) => Promise<boolean>
  fetchEmail: () => Promise<boolean>
  updateTier: (id: string, tier: MembershipTier) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
  setEmail: (email: string) => void
  setMembershipTier: (id: string, tier: MembershipTier) => void
}

const inFlightLoads = new Map<string, Promise<void>>()

/** Latest list or own-membership request. An older response must not overwrite a newer cookbook. */
let membershipListRequest = 0
let ownMembershipRequest = 0

function loadKey(cookbookId: string, pageNumber: number, pageSize: number) {
  return `${cookbookId}:${pageNumber}:${pageSize}`
}

export const useMembershipStore = create<MembershipState>((set, get) => ({
  memberships: emptyPaginatedList(),
  membershipsCookbookId: null,
  ownMembership: null,
  loadedCookbookId: null,
  email: null,

  loadForCookbook: async (cookbookId, pageNumber = 1, pageSize = 10, force = false) => {
    if (!cookbookId) return

    if (force) {
      await Promise.all([
        get().fetch(cookbookId, pageNumber, pageSize),
        get().singleByCookbookId(cookbookId, true),
      ])
      return
    }

    const key = loadKey(cookbookId, pageNumber, pageSize)
    const existing = inFlightLoads.get(key)
    if (existing) return existing

    const promise = Promise.all([
      get().fetch(cookbookId, pageNumber, pageSize),
      get().singleByCookbookId(cookbookId),
    ])
      .then(() => undefined)
      .finally(() => {
        inFlightLoads.delete(key)
      })

    inFlightLoads.set(key, promise)
    return promise
  },

  fetch: async (cookbookId, pageNumber = 1, pageSize = 10) => {
    const requestId = ++membershipListRequest
    const response = await api.getMemberships(cookbookId, pageNumber, pageSize)
    if (requestId !== membershipListRequest) return

    if (response.kind === "ok") {
      set({
        memberships: response.memberships as PaginatedList<Membership>,
        membershipsCookbookId: cookbookId,
      })
      return
    }

    console.error(`Error fetching memberships: ${JSON.stringify(response)}`)
    if (get().membershipsCookbookId !== cookbookId) {
      set({ memberships: emptyPaginatedList(), membershipsCookbookId: cookbookId })
    }
  },

  singleByCookbookId: async (cookbookId, force = false) => {
    if (!force && get().loadedCookbookId === cookbookId && get().ownMembership) {
      return true
    }

    const requestId = ++ownMembershipRequest
    const response = await api.getMembership(cookbookId)
    if (requestId !== ownMembershipRequest) return false

    if (response.kind === "ok") {
      set({
        ownMembership: response.membership as Membership,
        loadedCookbookId: cookbookId,
      })
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

  updateTier: async (id, tier) => {
    const response = await api.updateMembership(id, tier)
    if (response.kind === "ok") {
      get().setMembershipTier(id, tier)
      return true
    }
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

  setMembershipTier: (id, tier) => {
    const transferringOwnership = tier === MEMBERSHIP_TIER.Owner

    set({
      memberships: {
        ...get().memberships,
        items: get().memberships.items.map((m) => {
          if (m.id === id) return { ...m, tier }
          if (transferringOwnership && isOwnerTier(m.tier)) {
            return { ...m, tier: MEMBERSHIP_TIER.Contributor }
          }
          return m
        }),
      },
      ownMembership: (() => {
        const own = get().ownMembership
        if (!own) return null
        if (own.id === id) return { ...own, tier }
        if (transferringOwnership && isOwnerTier(own.tier)) {
          return { ...own, tier: MEMBERSHIP_TIER.Contributor }
        }
        return own
      })(),
    })
  },
}))
