import { observer } from "mobx-react-lite"
import React from "react"
import { ViewStyle, TextStyle, View } from "react-native"
import { Screen, Text, ListView, Divider } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { useLocalSearchParams, router } from "expo-router"
import { useHeader } from "src/utils/useHeader"

export default observer(function MembershipScreen() {
  const { membershipStore } = useStores()
  const membership = membershipStore.currentMembership

  useHeader({
    title: membership?.name || "Member Details",
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  if (!membership) return null

  const permissions = [
    { label: "Creator", value: membership.isCreator },
    { label: "Can Add Recipe", value: membership.canAddRecipe },
    { label: "Can Update Recipe", value: membership.canUpdateRecipe },
    { label: "Can Delete Recipe", value: membership.canDeleteRecipe },
    { label: "Can Send Invite", value: membership.canSendInvite },
    { label: "Can Remove Member", value: membership.canRemoveMember },
    { label: "Can Edit Cookbook Details", value: membership.canEditCookbookDetails },
  ]

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$root}>
      <ListView
        data={permissions}
        estimatedItemSize={50}
        ListHeaderComponent={
          <View>
            <View style={$headerContainer}>
              <Text preset="subheading" text={membership.email} style={$email} />
            </View>
            <Divider size={spacing.sm} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={$listItemStyle}>
            <View style={$permissionRow}>
              <Text text={item.label} />
              <Text 
                text={item.value ? "Yes" : "No"} 
                style={[item.value ? $permissionYes : $permissionNo]} 
              />
            </View>
          </View>
        )}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $headerContainer: ViewStyle = {
  paddingTop: spacing.lg,
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.md,
}

const $email: TextStyle = {
  color: colors.textDim,
}

const $listItemStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
  marginHorizontal: spacing.lg,
}

const $permissionRow: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $permissionYes: TextStyle = {
  color: colors.palette.primary500,
}

const $permissionNo: TextStyle = {
  color: colors.palette.angry500,
} 