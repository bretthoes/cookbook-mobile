import { INVITATION_LIST_PAGE_SIZE } from "@/constants/pagination"
import {
  createInvite,
  createInviteToken,
  getInvitationToken,
  getInvitations,
  updateInvitationToken,
  updateInvite,
} from "@/services/api/wrappers/invitations"
import { queryKeys } from "@/services/query/queryKeys"
import { unwrapApiResult } from "@/services/query/unwrapApiResult"
import { useIsAuthenticated } from "@/stores/authStore"
import type { InvitationList } from "@/types/invitation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useInvitationsQuery() {
  const isAuthenticated = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.invitations.list(),
    enabled: isAuthenticated,
    queryFn: async () => {
      const data = unwrapApiResult(await getInvitations(1, INVITATION_LIST_PAGE_SIZE))
      return data.invitations
    },
  })
}

export function useInvitationTokenQuery(token: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.invitations.token(token),
    enabled: enabled && token.length > 0,
    retry: false,
    queryFn: async () => {
      const data = unwrapApiResult(await getInvitationToken(token))
      return data.invitation
    },
  })
}

export type InvitationRespondResult = true | { success: false; conflict: boolean }

export function useRespondToInvitation() {
  const queryClient = useQueryClient()
  return useCallback(
    async (
      idOrToken: string,
      accepted: boolean,
      byToken = false,
    ): Promise<InvitationRespondResult> => {
      const response = byToken
        ? await updateInvitationToken(idOrToken, accepted)
        : await updateInvite(idOrToken, accepted)
      if (response.kind !== "ok") {
        return { success: false, conflict: response.kind === "conflict" }
      }
      if (!byToken) {
        queryClient.setQueryData<InvitationList>(queryKeys.invitations.list(), (current) => {
          if (!current) return current
          return {
            ...current,
            items: current.items.filter((invitation) => invitation.id !== idOrToken),
            totalCount: Math.max(0, current.totalCount - 1),
          }
        })
      }
      return true
    },
    [queryClient],
  )
}

export async function sendInvitationEmail(cookbookId: string, email: string) {
  const response = await createInvite(cookbookId, email)
  switch (response.kind) {
    case "ok":
      return { sent: true, message: "Your invite has been sent!" }
    case "not-found":
      return { sent: false, message: "No account exists with that email." }
    case "conflict":
      return { sent: false, message: "They've already been invited." }
    default:
      return { sent: false, message: "Something went wrong, please try again later." }
  }
}

export async function createInvitationLink(cookbookId: string) {
  const response = await createInviteToken(cookbookId)
  if (response.kind === "ok") return { token: response.token }
  return { message: "Error creating link." }
}
