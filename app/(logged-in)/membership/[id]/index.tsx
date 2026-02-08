import { Icon } from "@/components/Icon"
import { ItemNotFound } from "@/components/ItemNotFound"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { router, useLocalSearchParams } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Alert, FlatList, View, ViewStyle } from "react-native"

type DataItem = {
  label: string
  value: string | boolean | null
}

export default observer(function MembershipScreen() {
  const { membershipStore } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const membership = membershipStore.memberships.items.find((m) => m.id === parseInt(id))
  const { showActionSheetWithOptions } = useActionSheet()
  const [email, setEmail] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const { themed } = useAppTheme()

  // Memoize themed styles
  const $themedScreenContentContainer = React.useMemo(
    () => themed($screenContentContainer),
    [themed],
  )
  const $themedListContentContainer = React.useMemo(() => themed($listContentContainer), [themed])
  const $themedItem = React.useMemo(() => themed($item), [themed])

  const handlePressMore = () => {
    const options = isOwner
      ? ["Edit membership", "Delete membership", "Cancel"]
      : ["Delete membership", "Cancel"]
    const cancelButtonIndex = options.length - 1
    const destructiveButtonIndex = options.indexOf("Delete membership")

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return

        if (selectedIndex === 0 && isOwner) {
          router.push(`../membership/${id}/edit`)
        } else if (selectedIndex === (isOwner ? 1 : 0)) {
          Alert.alert(
            "Delete Member",
            "This will remove the member from this cookbook. Are you sure?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  const result = await membershipStore.delete(parseInt(id))
                  if (result) {
                  } else {
                    Alert.alert("Error", "Failed to delete membership")
                  }
                },
              },
            ],
          )
        }
      },
    )
  }

  useEffect(() => {
    SecureStore.getItemAsync("email").then((result) => {
      setEmail(result)
    })
  }, [])

  useEffect(() => {
    if (email && membershipStore.memberships?.items) {
      const userMembership = membershipStore.memberships.items.find(
        (m) => m.email === email && m.isOwner,
      )
      setIsOwner(!!userMembership)
    }
  }, [email, membershipStore.memberships?.items])

  useHeader(
    {
      leftIcon: "back",
      title: "Membership Details",
      onLeftPress: () => router.back(),
      rightIcon: isOwner ? "more" : undefined,
      onRightPress: isOwner ? handlePressMore : undefined,
    },
    [isOwner],
  )

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
      <Text text={item.label} size="sm" />
      {typeof item.value === "boolean" ? (
        <Icon icon={item.value ? "check" : "x"} size={20} />
      ) : (
        <Text text={item.value?.toString() || "-"} size="sm" />
      )}
    </View>
  )

  return (
    <Screen preset="fixed" contentContainerStyle={$themedScreenContentContainer}>
      <FlatList
        data={data}
        renderItem={renderItem}
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
