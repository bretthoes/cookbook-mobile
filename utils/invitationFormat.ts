import type { Invitation } from "@/types/invitation"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"
import { parseISO } from "date-fns/parseISO"

export function getInvitationSenderInfo(invitation: Invitation) {
  return `From: ${invitation.senderEmail}`
}

export function getInvitationTimeAgo(invitation: Invitation) {
  return formatDistanceToNow(parseISO(invitation.created), { addSuffix: true })
}

export function getParsedInvitationMessage(invitation: Invitation) {
  const title = invitation.cookbookTitle || "a cookbook"
  const senderInfo = invitation.senderName?.trim()
  return senderInfo
    ? `${senderInfo} invited you to join "${title}".`
    : `You have been invited to join "${title}".`
}
