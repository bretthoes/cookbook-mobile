import type { components } from "@/services/api/generated/schema"

export type MembershipTier = components["schemas"]["MembershipTier"]

export type Membership = components["schemas"]["MembershipDto"] & {
  id: number
  tier: MembershipTier
}

export type MembershipSnapshotIn = Pick<Membership, "id" | "tier">
export type MembershipSnapshotOut = Membership
export type MembershipListSnapshotIn = import("@/types/pagination").PaginatedList<Membership>
