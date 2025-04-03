import { observer } from "mobx-react-lite"
import React from "react"
import { Alert, View, ViewStyle } from "react-native"
import { ListView, Screen, Text, Switch } from "src/components"
import { colors, spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import { useStores } from "src/models/helpers/useStores"
import { useHeader } from "src/utils/useHeader"

type MembershipProperty = "canAddRecipe" | "canUpdateRecipe" | "canDeleteRecipe" | "canSendInvite" | "canRemoveMember" | "canEditCookbookDetails"

type DataItem = {
  label: string
  value: string | boolean | null
  type: "text" | "switch"
  key?: MembershipProperty
}

export default observer(function MembershipEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { membershipStore } = useStores()
  const membership = membershipStore.memberships.items.find(m => m.id === parseInt(id))

  useHeader({
    title: "Edit Member",
    leftIcon: "back",
    rightText: "Save",
    onLeftPress: () => router.back(),
    onRightPress: async () => {
      var result = await membershipStore.update(parseInt(id))
      if (result) {
        router.back()
      }
      else {
        Alert.alert("Error", "Failed to update membership")
      }
    }
  })

  if (!membership) return null

  const data: DataItem[] = [
    { label: "Email", value: membership.email, type: "text" },
    { label: "Name", value: membership.name, type: "text" },
    { label: "Can Add Recipe", value: membership.canAddRecipe, type: "switch", key: "canAddRecipe" },
    { label: "Can Update Recipe", value: membership.canUpdateRecipe, type: "switch", key: "canUpdateRecipe" },
    { label: "Can Delete Recipe", value: membership.canDeleteRecipe, type: "switch", key: "canDeleteRecipe" },
    { label: "Can Invite", value: membership.canSendInvite, type: "switch", key: "canSendInvite" },
    { label: "Can Manage Members", value: membership.canRemoveMember, type: "switch", key: "canRemoveMember" },
    { label: "Can Edit Cookbook Details", value: membership.canEditCookbookDetails, type: "switch", key: "canEditCookbookDetails" },
  ]

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={$item}>
      <Text text={item.label} size="sm" />
      {item.type === "switch" ? (
        <Switch
          value={item.value as boolean}
          onValueChange={(value) => {
            if (item.key) {
              membershipStore.setMembershipProperty(parseInt(id), item.key, value)
            }
          }}
        />
      ) : (
        <Text text={item.value?.toString() || "-"} size="sm" />
      )}
    </View>
  )

  return (
    <Screen preset="scroll" contentContainerStyle={$screenContentContainer}>
      <ListView
        data={data}
        renderItem={renderItem}
        estimatedItemSize={56}
        contentContainerStyle={$listContentContainer}
      />
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ViewStyle = {
  padding: spacing.md,
}

const $item: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral300,
}
