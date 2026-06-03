import type { components } from "@/services/api/generated/schema"
import type { PaginatedList } from "@/types/pagination"

export type Invitation = {
  id: string
  cookbookId?: string | null
  senderName?: string | null
  cookbookTitle: string
  cookbookImage?: string | null
  created: string
}

export type InvitationSnapshotIn = Invitation
export type InvitationSnapshotOut = Invitation
export type InvitationListSnapshotIn = PaginatedList<Invitation>

export enum CookbookInvitationStatus {
  Error = 0,
  Active = 1,
  Accepted = 2,
  Rejected = 3,
  Revoked = 4,
}

export type InvitationDto = components["schemas"]["InvitationDto"]
