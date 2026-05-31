import type { IconTypes } from "@/components/Icon"
import type { TxKeyPath } from "@/i18n"
import type { MembershipTier } from "@/types/membership"

export const MEMBERSHIP_TIER = {
  Viewer: 0,
  Contributor: 1,
  Admin: 2,
  Owner: 3,
} as const satisfies Record<string, MembershipTier>

export const ALL_MEMBERSHIP_TIERS: MembershipTier[] = [
  MEMBERSHIP_TIER.Viewer,
  MEMBERSHIP_TIER.Contributor,
  MEMBERSHIP_TIER.Admin,
  MEMBERSHIP_TIER.Owner,
]

export function tierLabelTx(tier: MembershipTier): TxKeyPath {
  switch (tier) {
    case MEMBERSHIP_TIER.Owner:
      return "membershipScreen:tier.owner"
    case MEMBERSHIP_TIER.Admin:
      return "membershipScreen:tier.admin"
    case MEMBERSHIP_TIER.Contributor:
      return "membershipScreen:tier.contributor"
    default:
      return "membershipScreen:tier.viewer"
  }
}

export function tierDescriptionTx(tier: MembershipTier): TxKeyPath {
  switch (tier) {
    case MEMBERSHIP_TIER.Owner:
      return "membershipScreen:tierDescription.owner"
    case MEMBERSHIP_TIER.Admin:
      return "membershipScreen:tierDescription.admin"
    case MEMBERSHIP_TIER.Contributor:
      return "membershipScreen:tierDescription.contributor"
    default:
      return "membershipScreen:tierDescription.viewer"
  }
}

export function tierIcon(tier: MembershipTier): IconTypes {
  switch (tier) {
    case MEMBERSHIP_TIER.Owner:
      return "crown"
    case MEMBERSHIP_TIER.Admin:
      return "settings"
    case MEMBERSHIP_TIER.Contributor:
      return "pen"
    default:
      return "hidden"
  }
}

export function canManageMembers(tier: MembershipTier | undefined): boolean {
  return tier === MEMBERSHIP_TIER.Owner || tier === MEMBERSHIP_TIER.Admin
}

export function isOwnerTier(tier: MembershipTier | undefined): boolean {
  return tier === MEMBERSHIP_TIER.Owner
}

export function isAdminOrOwner(tier: MembershipTier | undefined): boolean {
  return tier === MEMBERSHIP_TIER.Owner || tier === MEMBERSHIP_TIER.Admin
}

export function assignableTiers(
  actorTier: MembershipTier | undefined,
  targetTier: MembershipTier,
): MembershipTier[] {
  if (actorTier === MEMBERSHIP_TIER.Owner) {
    return ALL_MEMBERSHIP_TIERS
  }

  if (
    actorTier === MEMBERSHIP_TIER.Admin &&
    (targetTier === MEMBERSHIP_TIER.Contributor || targetTier === MEMBERSHIP_TIER.Viewer)
  ) {
    return [MEMBERSHIP_TIER.Viewer, MEMBERSHIP_TIER.Contributor, MEMBERSHIP_TIER.Admin]
  }

  return []
}

export function canEditAnyRecipe(tier: MembershipTier | undefined): boolean {
  return isAdminOrOwner(tier)
}

export function canDeleteAnyRecipe(tier: MembershipTier | undefined): boolean {
  return isAdminOrOwner(tier)
}
