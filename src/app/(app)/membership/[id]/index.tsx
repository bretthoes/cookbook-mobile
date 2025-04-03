import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { ViewStyle, TextStyle, View, Alert } from "react-native"
import { Screen, Text, ListView, Icon } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import { useHeader } from "src/utils/useHeader"
import { useActionSheet } from "@expo/react-native-action-sheet"
import * as SecureStore from "expo-secure-store"

export default observer(function MembershipScreen() {
  const { membershipStore } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const membership = membershipStore.memberships.items.find(m => m.id === parseInt(id))
  const { showActionSheetWithOptions } = useActionSheet()
  const [email, setEmail] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState<boolean>(false)

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

  const handlePressMore = () => {
    const options = ["Edit", "Delete", "Cancel"]
    const cancelButtonIndex = 2

    showActionSheetWithOptions(
      { 
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          // Edit
          router.push(`/membership/${id}/edit`)
        } else if (selectedIndex === 1) {
          // Delete
          Alert.alert(
            "Delete Member",
            "Are you sure you want to delete this member?",
            [
              {
                text: "Cancel",
                style: "cancel"
              },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  await membershipStore.delete(parseInt(id))
                  router.back()
                }
              }
            ]
          )
        }
      },
    )
  }

  useHeader({
    leftIcon: "back",
    title: "Membership Details",
    onLeftPress: () => router.back(),
    rightIcon: isOwner ? "more" : undefined,
    onRightPress: isOwner ? handlePressMore : undefined,
  }, [isOwner])

  if (!membership) return null

  const permissions = [
    { label: "Name", value: membership.name ?? "" },
    { label: "Cookbook Owner", value: membership.isCreator },
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
        estimatedItemSize={56}
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
                text={
                  typeof item.value === "boolean" ? (item.value ? "Yes" : "No") : item.value || "-"
                }
                style={
                  typeof item.value === "boolean"
                    ? item.value
                      ? $permissionYes
                      : $permissionNo
                    : $textValue
                }
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
  backgroundColor: colors.backgroundDim,
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

