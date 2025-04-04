import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { ViewStyle, TextStyle, View, Alert } from "react-native"
import { Screen, Text, ListView, Icon, Button } from "src/components"
import { ItemNotFound } from "src/components/ItemNotFound"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import { useHeader } from "src/utils/useHeader"
import { useActionSheet } from "@expo/react-native-action-sheet"
import * as SecureStore from "expo-secure-store"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

type DataItem = {
  label: string
  value: string | boolean | null
}

export default observer(function MembershipScreen() {
  const { membershipStore } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const membership = membershipStore.memberships.items.find(m => m.id === parseInt(id))
  const { showActionSheetWithOptions } = useActionSheet()
  const [email, setEmail] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const { themed } = useAppTheme()

  // Memoize themed styles
  const $themedScreenContentContainer = React.useMemo(() => themed($screenContentContainer), [themed])
  const $themedListContentContainer = React.useMemo(() => themed($listContentContainer), [themed])
  const $themedItem = React.useMemo(() => themed($item), [themed])
  const $themedLabel = React.useMemo(() => themed($label), [themed])
  const $themedValue = React.useMemo(() => themed($value), [themed])

  const handlePressMore = () => {
    const options = ["Edit membership", "Delete membership", "Cancel"]
    const cancelButtonIndex = 2

    showActionSheetWithOptions(
      { 
        options,
        cancelButtonIndex,
        destructiveButtonIndex: 1,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          // Edit
          router.push(`/membership/${id}/edit`)
        } else if (selectedIndex === 1) {
          // Delete
          Alert.alert(
            "Delete Member",
            "This will remove the member from this cookbook. Are you sure?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  var result = await membershipStore.delete(parseInt(id)) 
                  if (result) {
                    router.back()
                  }
                  else {
                    Alert.alert("Error", "Failed to delete membership")
                  }
                }
              }
            ]
          )
        }
      },
    )
  }
  
  const permissions = [
    { label: "Name", value: membership?.name ?? "" },
    { label: "Cookbook Owner", value: membership?.isCreator },
    { label: "Can Add Recipe", value: membership?.canAddRecipe },
    { label: "Can Update Recipe", value: membership?.canUpdateRecipe },
    { label: "Can Delete Recipe", value: membership?.canDeleteRecipe },
    { label: "Can Send Invite", value: membership?.canSendInvite },
    { label: "Can Remove Member", value: membership?.canRemoveMember },
    { label: "Can Edit Cookbook Details", value: membership?.canEditCookbookDetails },
  ]

  useEffect(() => {
    SecureStore.getItemAsync("email").then((result) => {
      setEmail(result)
    })
  }, [])

  useEffect(() => {
    if (email && membershipStore.memberships?.items) {
      const userMembership = membershipStore.memberships.items.find(
        (m) => m.email === email && m.isCreator
      )
      setIsOwner(!!userMembership)
    }
  }, [email, membershipStore.memberships?.items])

  useHeader({
    leftIcon: "back",
    title: "Membership Details",
    onLeftPress: () => router.back(),
    rightIcon: isOwner ? "more" : undefined,
    onRightPress: isOwner ? handlePressMore : undefined,
  }, [isOwner])

  if (!membership) {
    return <ItemNotFound message="Membership not found" />
  }

  const data: DataItem[] = [
    { label: "Email", value: membership.email },
    { label: "Name", value: membership.name },
    { label: "Can Add Recipe", value: membership.canAddRecipe },
    { label: "Can Update Recipe", value: membership.canUpdateRecipe },
    { label: "Can Delete Recipe", value: membership.canDeleteRecipe },
    { label: "Can Invite", value: membership.canSendInvite },
    { label: "Can Manage Members", value: membership.canRemoveMember },
    { label: "Can Edit Cookbook Details", value: membership.canEditCookbookDetails },
  ]

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={$themedItem}>
      <Text text={item.label} style={$themedLabel} />
      <Text text={item.value?.toString() || "-"} style={$themedValue} />
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

const $label: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: 16,
})

const $value: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontSize: 16,
  fontWeight: "500",
})

