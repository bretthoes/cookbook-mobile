import { Icon } from "@/components/Icon"
import { ItemNotFound } from "@/components/ItemNotFound"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n"
import type { TxKeyPath } from "@/i18n"
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
  labelTx: TxKeyPath
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
      ? [
          translate("membershipScreen:actionEdit"),
          translate("membershipScreen:actionDelete"),
          translate("membershipScreen:actionCancel"),
        ]
      : [translate("membershipScreen:actionDelete"), translate("membershipScreen:actionCancel")]
    const cancelButtonIndex = options.length - 1
    const destructiveButtonIndex = options.indexOf(translate("membershipScreen:actionDelete"))

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
            translate("membershipScreen:deleteMemberTitle"),
            translate("membershipScreen:deleteMemberMessage"),
            [
              {
                text: translate("membershipScreen:actionCancel"),
                style: "cancel",
              },
              {
                text: translate("membershipScreen:deleteButton"),
                style: "destructive",
                onPress: async () => {
                  const result = await membershipStore.delete(parseInt(id))
                  if (result) {
                  } else {
                    Alert.alert(
                      translate("membershipScreen:errorTitle"),
                      translate("membershipScreen:deleteFailed"),
                    )
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
      titleTx: "membershipScreen:detailTitle",
      onLeftPress: () => router.back(),
      rightIcon: isOwner ? "more" : undefined,
      onRightPress: isOwner ? handlePressMore : undefined,
    },
    [isOwner],
  )

  if (!membership) {
    return <ItemNotFound message={translate("membershipScreen:notFound")} />
  }

  const data: DataItem[] = [
    { labelTx: "membershipScreen:labels.email", value: membership.email },
    { labelTx: "membershipScreen:labels.name", value: membership.name },
    { labelTx: "membershipScreen:labels.isOwner", value: membership.isOwner },
    { labelTx: "membershipScreen:labels.canAddRecipe", value: membership.canAddRecipe },
    { labelTx: "membershipScreen:labels.canUpdateRecipe", value: membership.canUpdateRecipe },
    { labelTx: "membershipScreen:labels.canDeleteRecipe", value: membership.canDeleteRecipe },
    { labelTx: "membershipScreen:labels.canInvite", value: membership.canSendInvite },
    { labelTx: "membershipScreen:labels.canManageMembers", value: membership.canRemoveMember },
    {
      labelTx: "membershipScreen:labels.canEditCookbookDetails",
      value: membership.canEditCookbookDetails,
    },
  ]

  const renderItem = ({ item }: { item: DataItem }) => (
    <View style={$themedItem}>
      <Text tx={item.labelTx} size="sm" />
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
