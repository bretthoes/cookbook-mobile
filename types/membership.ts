import type { components } from "@/services/api/generated/schema"

export type Membership = components["schemas"]["MembershipDto"] & {
  id: number
}

export type MembershipSnapshotIn = Membership
export type MembershipSnapshotOut = Membership
export type MembershipListSnapshotIn = import("@/types/pagination").PaginatedList<Membership>
