import { api } from "@/services/api"
import type { Invitation } from "@/types/invitation"
import { emptyPaginatedList, type PaginatedList } from "@/types/pagination"
import { create } from "zustand"

export interface InvitationState {
  invitation: Invitation | null
  invitations: PaginatedList<Invitation>

  single: (token: string) => Promise<void>
  fetch: (pageNumber?: number, pageSize?: number) => Promise<void>
  count: () => Promise<number>
  respond: (
    idOrToken: string,
    accepted: boolean,
    byToken?: boolean,
  ) => Promise<boolean | { success: false; conflict: boolean }>
  invite: (cookbookId: string, email: string) => Promise<string>
  link: (cookbookId: string) => Promise<{ token: string } | { message: string }>
}

export const useInvitationStore = create<InvitationState>((set, get) => ({
  invitation: null,
  invitations: emptyPaginatedList(),

  single: async (token) => {
    const response = await api.GetInvitationToken(token)
    if (response.kind === "ok") {
      set({ invitation: response.invitation as Invitation })
    } else {
      console.error(`Error fetching invitation: ${JSON.stringify(response)}`)
    }
  },

  fetch: async (pageNumber = 1, pageSize = 10) => {
    const response = await api.GetInvitations(pageNumber, pageSize)
    if (response.kind === "ok") {
      set({ invitations: response.invitations as PaginatedList<Invitation> })
    } else {
      console.error(`Error fetching invitations: ${JSON.stringify(response)}`)
    }
  },

  count: async () => {
    const response = await api.GetInvitationCount()
    if (response.kind === "ok") {
      set({
        invitations: {
          ...get().invitations,
          totalCount: response.count,
        },
      })
      return response.count
    }
    console.error(`Error fetching invitation count: ${JSON.stringify(response)}`)
    return 0
  },

  respond: async (idOrToken, accepted, byToken = false) => {
    const response = byToken
      ? await api.UpdateInvitationToken(idOrToken, accepted)
      : await api.updateInvite(idOrToken, accepted)

    if (response.kind === "ok") {
      if (!byToken) {
        const invitations = get().invitations
        set({
          invitations: {
            ...invitations,
            items: invitations.items.filter((inv) => inv.id !== idOrToken),
            totalCount: Math.max(0, invitations.totalCount - 1),
          },
        })
      }
      return true
    }
    return { success: false, conflict: response.kind === "conflict" }
  },

  invite: async (cookbookId, email) => {
    const response = await api.createInvite(cookbookId, email)
    switch (response.kind) {
      case "ok":
        return "Your invite has been sent!"
      case "not-found":
        return "No account exists with that email."
      case "conflict":
        return "They've already been invited."
      default:
        return "Something went wrong, please try again later."
    }
  },

  link: async (cookbookId) => {
    const response = await api.createInviteToken(cookbookId)
    if (response.kind === "ok") return { token: response.token }
    return { message: "Error creating link." }
  },
}))
