import { observer } from "mobx-react-lite"
import React from "react"
import { ViewStyle, TextStyle, View } from "react-native"
import { Screen, Text, ListView } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { useLocalSearchParams, router } from "expo-router"
import { useHeader } from "src/utils/useHeader"

export default observer(function MembershipScreen() {
  const { membershipStore } = useStores()
  const membership = membershipStore.currentMembership

  useHeader({
    leftIcon: "back",
    title: "Membership Details",
    onLeftPress: () => router.back(),
  })

  if (!membership) return null

  const permissions = [
    { label: "Email", value: membership.email },
    { label: "Name", value: membership.name ?? "" },
    { label: "Creator", value: membership.isCreator },
    { label: "Can Add Recipe", value: membership.canAddRecipe },
    { label: "Can Update Recipe", value: membership.canUpdateRecipe },
    { label: "Can Delete Recipe", value: membership.canDeleteRecipe },
    { label: "Can Send Invite", value: membership.canSendInvite },
    { label: "Can Remove Member", value: membership.canRemoveMember },
    { label: "Can Edit Cookbook Details", value: membership.canEditCookbookDetails },
  ]

  return (
    <Screen preset="scroll" style={$root}>
      <ListView
        data={permissions}
        estimatedItemSize={50}
        ListHeaderComponent={
          <View>
            <Text
              text={`${membership.email}`}
              style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={$listItemStyle}>
            <View style={$permissionRow}>
              <Text text={item.label} />
              <Text 
                text={typeof item.value === 'boolean' 
                  ? (item.value ? "Yes" : "No")
                  : item.value || "-"} 
                style={typeof item.value === 'boolean' 
                  ? (item.value ? $permissionYes : $permissionNo)
                  : $textValue} 
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

const $textValue: TextStyle = {
  color: colors.text,
} 