import { ItemNotFound } from "@/components/ItemNotFound"
import { MemberSummary } from "@/components/Membership/MemberSummary"
import { OptionListItem, $listContainer } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n"
import { useSelectedCookbook } from "@/hooks/useSelectedCookbook"
import { useMembershipStore } from "@/stores/membershipStore"
import type { MembershipTier } from "@/types/membership"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import {
  ALL_MEMBERSHIP_TIERS,
  assignableTiers,
  canManageMembers,
  isOwnerTier,
  MEMBERSHIP_TIER,
  tierDescriptionTx,
  tierIcon,
  tierLabelTx,
} from "@/utils/membershipTier"
import { useHeader } from "@/utils/useHeader"
import { router, useLocalSearchParams } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, TextStyle, View } from "react-native"

export default function MembershipEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const membershipId = id ?? ""
  const membership = useMembershipStore((s) =>
    s.memberships.items.find((m) => m.id === membershipId),
  )
  const ownMembership = useMembershipStore((s) => s.ownMembership)
  const loadedCookbookId = useMembershipStore((s) => s.loadedCookbookId)
  const loadForCookbook = useMembershipStore((s) => s.loadForCookbook)
  const updateTier = useMembershipStore((s) => s.updateTier)
  const { selected: selectedCookbook } = useSelectedCookbook()
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null)
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const [resultIsSuccess, setResultIsSuccess] = useState(false)
  const { themed } = useAppTheme()
  const { isInFlight, run } = useInFlightAction()

  const cookbookId = selectedCookbook?.id ?? ""

  const $themedSectionLabel = useMemo(() => themed($sectionLabel), [themed])
  const $themedCurrentRole = useMemo(() => themed($currentRole), [themed])
  const $themedUnsavedChanges = useMemo(() => themed($unsavedChanges), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])
  const $themedResultMessage = useMemo(() => themed($resultMessage), [themed])
  const $themedSuccessMessage = useMemo(() => themed($successMessage), [themed])
  const $themedErrorMessage = useMemo(() => themed($errorMessage), [themed])

  useEffect(() => {
    if (!cookbookId || loadedCookbookId === cookbookId) return
    void loadForCookbook(cookbookId)
  }, [cookbookId, loadForCookbook, loadedCookbookId])

  useEffect(() => {
    if (membership) setSelectedTier(membership.tier)
  }, [membership])

  const isDirty =
    selectedTier !== null && membership !== undefined && selectedTier !== membership.tier

  const handleSave = useCallback(() => {
    if (selectedTier === null || !isDirty) return

    run(async () => {
      const result = await updateTier(membershipId, selectedTier)
      if (result) {
        if (selectedTier === MEMBERSHIP_TIER.Owner) {
          await loadForCookbook(cookbookId, 1, 10, true)
          router.back()
          return
        }
        setResultMessage(translate("membershipScreen:updateSuccess"))
        setResultIsSuccess(true)
      } else {
        setResultMessage(translate("membershipScreen:updateFailed"))
        setResultIsSuccess(false)
      }
    })
  }, [cookbookId, isDirty, membershipId, run, selectedTier, loadForCookbook, updateTier])

  useHeader(
    {
      titleTx: "membershipScreen:editTitle",
      leftIcon: "back",
      rightTx: isDirty ? "common:save" : undefined,
      onLeftPress: () => router.back(),
      onRightPress: isDirty && !isInFlight ? handleSave : undefined,
    },
    [handleSave, isDirty, isInFlight],
  )

  if (!membership) return <ItemNotFound message={translate("membershipScreen:notFound")} />

  const isCurrentUserMembership = ownMembership?.id === membershipId
  const canEditMembership = canManageMembers(ownMembership?.tier) && !isCurrentUserMembership

  if (!canEditMembership) {
    return <ItemNotFound message={translate("membershipScreen:notFound")} />
  }

  const tierOptions = assignableTiers(ownMembership?.tier, membership.tier)
  const memberName = membership.name ?? translate("membershipScreen:editMemberFallback")
  const currentTierLabel = translate(tierLabelTx(membership.tier))

  const handleSelectTier = (tier: MembershipTier) => {
    if (!tierOptions.includes(tier)) return

    if (tier === MEMBERSHIP_TIER.Owner && !isOwnerTier(membership.tier)) {
      Alert.alert(
        translate("membershipScreen:promoteToOwnerTitle"),
        translate("membershipScreen:promoteToOwnerMessage"),
        [
          { text: translate("membershipScreen:actionCancel"), style: "cancel" },
          {
            text: translate("membershipScreen:confirmButton"),
            style: "destructive",
            onPress: () => setSelectedTier(tier),
          },
        ],
      )
      return
    }

    setSelectedTier(tier)
    setResultMessage(null)
  }

  const activeTier = selectedTier ?? membership.tier

  return (
    <Screen preset="scroll">
      <MemberSummary
        name={memberName}
        captionTx="membershipScreen:editMemberSubtitle"
      />
      <Text
        tx="membershipScreen:currentRole"
        txOptions={{ role: currentTierLabel }}
        style={$themedCurrentRole}
      />
      {isDirty && <Text tx="membershipScreen:unsavedChanges" style={$themedUnsavedChanges} />}

      <Text tx="membershipScreen:roleSectionTitle" style={$themedSectionLabel} />

      <View style={$themedListContainer}>
        {ALL_MEMBERSHIP_TIERS.map((tier) => {
          const isAssignable = tierOptions.includes(tier)
          const isCurrentSavedTier = tier === membership.tier
          const description = translate(tierDescriptionTx(tier))
          const currentSuffix = isCurrentSavedTier
            ? ` ${translate("membershipScreen:currentTierSuffix")}`
            : ""

          return (
            <OptionListItem
              key={tier}
              title={translate(tierLabelTx(tier))}
              description={`${description}${currentSuffix}`}
              leftIcon={tierIcon(tier)}
              selected={activeTier === tier}
              disabled={!isAssignable}
              onPress={() => handleSelectTier(tier)}
            />
          )
        })}
      </View>

      {resultMessage && (
        <Text
          text={resultMessage}
          style={[
            $themedResultMessage,
            resultIsSuccess ? $themedSuccessMessage : $themedErrorMessage,
          ]}
        />
      )}
    </Screen>
  )
}

const $sectionLabel: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.sm,
  color: theme.colors.textDim,
  fontSize: 14,
})

const $currentRole: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.xs,
})

const $unsavedChanges: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.md,
  color: theme.colors.tint,
})

const $resultMessage: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  padding: theme.spacing.md,
  margin: theme.spacing.lg,
  borderRadius: theme.spacing.xs,
})

const $successMessage: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})

const $errorMessage: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
})
