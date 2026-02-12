import { Icon } from "@/components/Icon"
import { ItemNotFound } from "@/components/ItemNotFound"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router, useLocalSearchParams } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Alert, FlatList, TextStyle, View, ViewStyle } from "react-native"

type MembershipProperty =
  | "isOwner"
  | "canAddRecipe"
  | "canUpdateRecipe"
  | "canDeleteRecipe"
  | "canSendInvite"
  | "canRemoveMember"
  | "canEditCookbookDetails"

type DataItem = {
  label: string
  value: string | boolean | null
  type: "text" | "switch"
  key?: MembershipProperty
  canToggle?: boolean
}

export default observer(function MembershipEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { membershipStore, cookbookStore } = useStores()
  const membership = membershipStore.memberships.items.find((m) => m.id === parseInt(id))
  const [resultMessage, setResultMessage] = useState<string | null>(null)
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
  const $themedResultMessage = React.useMemo(() => themed($resultMessage), [themed])
  const $themedSuccessMessage = React.useMemo(() => themed($successMessage), [themed])
  const $themedErrorMessage = React.useMemo(() => themed($errorMessage), [themed])

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
    },
  })

  if (!membership) return <ItemNotFound message="Membership not found" />

  const isCurrentUserMembership = membership.email?.toLowerCase() === email?.toLowerCase()
  const canToggleOwner = isOwner && !isCurrentUserMembership

  const handleToggleOwner = (newValue: boolean) => {
    // Safety check: only current owner can toggle ownership
    if (!isOwner) {
      Alert.alert("Error", "Only the cookbook owner can change ownership.")
      return
    }

    // Safety check: cannot toggle own membership
    if (isCurrentUserMembership) {
      Alert.alert("Error", "You cannot change your own ownership status.")
      return
    }

    const currentValue = membership.isOwner
    if (newValue === currentValue) return // No change

    const cookbookId = cookbookStore.selected?.id
    if (!cookbookId) {
      Alert.alert("Error", "Cookbook not found. Please try again.")
      return
    }

    if (newValue) {
      // Promoting to owner - show confirmation first
      Alert.alert(
        "Promote to Owner",
        "Are you sure? This will forfeit your ownership of this cookbook.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Confirm",
            style: "destructive",
            onPress: async () => {
              // Update optimistically
              membershipStore.setMembershipProperty(parseInt(id), "isOwner", true)
              const success = await membershipStore.toggleOwner(parseInt(id), true)
              if (success) {
                // Refresh ownMembership to reflect the ownership change
                await membershipStore.singleByCookbookId(cookbookId)
              } else {
                // Revert on failure
                membershipStore.setMembershipProperty(parseInt(id), "isOwner", false)
                Alert.alert("Error", "Failed to update ownership. Please try again.")
              }
            },
          },
        ],
      )
    } else {
      // Demoting from owner - update directly (no confirmation needed)
      membershipStore.setMembershipProperty(parseInt(id), "isOwner", false)
      membershipStore.toggleOwner(parseInt(id), false).then(async (success) => {
        if (success) {
          // Refresh ownMembership to reflect the ownership change
          await membershipStore.singleByCookbookId(cookbookId)
        } else {
          // Revert on failure
          membershipStore.setMembershipProperty(parseInt(id), "isOwner", true)
          Alert.alert("Error", "Failed to update ownership. Please try again.")
        }
      })
    }
  }

  const data: DataItem[] = [
    { label: "Email", value: membership.email, type: "text" },
    { label: "Name", value: membership.name, type: "text" },
    {
      label: "Is Owner",
      value: membership.isOwner,
      type: "switch",
      key: "isOwner",
      canToggle: canToggleOwner,
    },
    {
      label: "Can Add Recipe",
      value: membership.canAddRecipe,
      type: "switch",
      key: "canAddRecipe",
    },
    {
      label: "Can Update Recipe",
      value: membership.canUpdateRecipe,
      type: "switch",
      key: "canUpdateRecipe",
    },
    {
      label: "Can Delete Recipe",
      value: membership.canDeleteRecipe,
      type: "switch",
      key: "canDeleteRecipe",
    },
    { label: "Can Invite", value: membership.canSendInvite, type: "switch", key: "canSendInvite" },
    {
      label: "Can Manage Members",
      value: membership.canRemoveMember,
      type: "switch",
      key: "canRemoveMember",
    },
    {
      label: "Can Edit Cookbook Details",
      value: membership.canEditCookbookDetails,
      type: "switch",
      key: "canEditCookbookDetails",
    },
  ]

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={$themedItem}>
      <Text text={item.label} size="sm" />
      {item.type === "switch" ? (
        <Switch
          value={item.value as boolean}
          onValueChange={(value) => {
            if (item.key === "isOwner") {
              handleToggleOwner(value)
            } else if (item.key) {
              membershipStore.setMembershipProperty(parseInt(id), item.key, value)
            }
          }}
          disabled={item.key === "isOwner" && !item.canToggle}
        />
      ) : typeof item.value === "boolean" ? (
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
      {resultMessage && (
        <Text
          text={resultMessage}
          style={[
            $themedResultMessage,
            resultMessage.includes("successfully") ? $themedSuccessMessage : $themedErrorMessage,
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
