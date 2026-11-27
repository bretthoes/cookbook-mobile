import type { components } from "@/services/api/generated/schema"
import type { PaginatedList } from "@/types/pagination"

export type MembershipTier = components["schemas"]["MembershipTier"]

export type Membership = components["schemas"]["MembershipDto"] & {
  id: string
  tier: MembershipTier
}

export type MembershipList = PaginatedList<Membership>
