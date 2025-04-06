import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Alert, View, ViewStyle, TextStyle } from "react-native"
import { ListView, Screen, Text, Switch } from "src/components"
import { colors, spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import { useStores } from "src/models/helpers/useStores"
import { useHeader } from "src/utils/useHeader"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { ItemNotFound } from "src/components/ItemNotFound"

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
  const [resultMessage, setResultMessage] = useState<string | null>(null)
  const { themed } = useAppTheme()

  // Memoize themed styles
  const $themedScreenContentContainer = React.useMemo(() => themed($screenContentContainer), [themed])
  const $themedListContentContainer = React.useMemo(() => themed($listContentContainer), [themed])
  const $themedItem = React.useMemo(() => themed($item), [themed])
  const $themedResultMessage = React.useMemo(() => themed($resultMessage), [themed])
  const $themedSuccessMessage = React.useMemo(() => themed($successMessage), [themed])
  const $themedErrorMessage = React.useMemo(() => themed($errorMessage), [themed])

  useHeader({
    title: "Edit Member",
    leftIcon: "back",
    rightText: "Save",
    onLeftPress: () => router.back(),
    onRightPress: async () => {
      const result = await membershipStore.update(parseInt(id))
      if (result) {
        setResultMessage("Membership updated successfully.")
      } else {
        setResultMessage("Failed to update membership. Please try again.")
      }
    }
  })

  if (!membership) return <ItemNotFound message="Membership not found" />

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
    <View style={$themedItem}>
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
    <Screen preset="scroll" contentContainerStyle={$themedScreenContentContainer}>
      <ListView
        data={data}
        renderItem={renderItem}
        estimatedItemSize={56}
        contentContainerStyle={$themedListContentContainer}
      />
      {resultMessage && (
        <Text 
          text={resultMessage} 
          style={[
            $themedResultMessage,
            resultMessage.includes("successfully") ? $themedSuccessMessage : $themedErrorMessage
          ]} 
        />
      )}
    </Screen>
  )
})

const $screenContentContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
})

const $listContentContainer: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
})

const $item: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: theme.spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.separator,
})

const $resultMessage: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  padding: theme.spacing.md,
  margin: theme.spacing.md,
  borderRadius: theme.spacing.xs,
})

const $successMessage: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})

const $errorMessage: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
})
