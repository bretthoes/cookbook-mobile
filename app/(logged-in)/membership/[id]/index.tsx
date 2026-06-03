import { ItemNotFound } from "@/components/ItemNotFound"
import { MemberSummary } from "@/components/Membership/MemberSummary"
import { OptionListItem, $listContainer } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n"
import { useMembershipStore } from "@/stores/membershipStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { canManageMembers, tierDescriptionTx, tierIcon, tierLabelTx } from "@/utils/membershipTier"
import { useHeader } from "@/utils/useHeader"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { router, useLocalSearchParams } from "expo-router"
import React, { useCallback, useMemo } from "react"
import { Alert, TextStyle, View } from "react-native"

export default function MembershipScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const membershipId = id ?? ""
  const membership = useMembershipStore((s) =>
    s.memberships.items.find((m) => m.id === membershipId),
  )
  const ownMembership = useMembershipStore((s) => s.ownMembership)
  const deleteMembership = useMembershipStore((s) => s.delete)
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()

  const isViewingOwnMembership = ownMembership?.id === membershipId
  const canShowActions = canManageMembers(ownMembership?.tier) && !isViewingOwnMembership

  const $themedSectionLabel = useMemo(() => themed($sectionLabel), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])
  const $themedEditHint = useMemo(() => themed($editHint), [themed])

  const handlePressEdit = useCallback(() => {
    router.push(`/(logged-in)/membership/${id}/edit`)
  }, [id])

  const handlePressMore = useCallback(() => {
    const editLabel = translate("membershipScreen:actionEdit")
    const deleteLabel = translate("membershipScreen:actionDelete")
    const cancelLabel = translate("membershipScreen:actionCancel")
    const options = [editLabel, deleteLabel, cancelLabel]
    const cancelButtonIndex = options.length - 1
    const destructiveButtonIndex = options.indexOf(deleteLabel)

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return

        if (selectedIndex === 0) {
          handlePressEdit()
        } else if (selectedIndex === 1) {
          Alert.alert(
            translate("membershipScreen:deleteMemberTitle"),
            translate("membershipScreen:deleteMemberMessage"),
            [
              {
                text: cancelLabel,
                style: "cancel",
              },
              {
                text: translate("membershipScreen:deleteButton"),
                style: "destructive",
                onPress: () => {
                  router.back()
                  void deleteMembership(membershipId).then((result) => {
                    if (!result) {
                      Alert.alert(
                        translate("membershipScreen:errorTitle"),
                        translate("membershipScreen:deleteFailed"),
                      )
                    }
                  })
                },
              },
            ],
          )
        }
      },
    )
  }, [deleteMembership, handlePressEdit, membershipId, showActionSheetWithOptions])

  useHeader(
    {
      leftIcon: "back",
      titleTx: "membershipScreen:detailTitle",
      onLeftPress: () => router.back(),
      rightIcon: canShowActions ? "more" : undefined,
      onRightPress: canShowActions ? handlePressMore : undefined,
    },
    [canShowActions, handlePressMore],
  )

  if (!membership) {
    return <ItemNotFound message={translate("membershipScreen:notFound")} />
  }

  const memberName = membership.name ?? translate("membershipScreen:editMemberFallback")
  const tierTitle = translate(tierLabelTx(membership.tier))
  const tierDescription = translate(tierDescriptionTx(membership.tier))

  return (
    <Screen preset="scroll">
      <MemberSummary name={memberName} />

      <Text tx="membershipScreen:roleSectionTitle" style={$themedSectionLabel} />

      <View style={$themedListContainer}>
        <OptionListItem
          title={tierTitle}
          description={tierDescription}
          leftIcon={tierIcon(membership.tier)}
          selected
          readOnly={!canShowActions}
          onPress={canShowActions ? handlePressEdit : undefined}
        />
      </View>

      {canShowActions && <Text tx="membershipScreen:editRoleHint" style={$themedEditHint} />}
    </Screen>
  )
}

const $sectionLabel: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.sm,
  color: theme.colors.textDim,
  fontSize: 14,
})

const $editHint: ThemedStyle<TextStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  marginTop: theme.spacing.sm,
  color: theme.colors.textDim,
  fontSize: 14,
})
