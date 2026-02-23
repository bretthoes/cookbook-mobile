import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { Image, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

const link = require("../../../assets/images/link.png")

export default observer(function AddInvitationOptionsScreen() {
  const { themeContext, themed } = useAppTheme()
  const isDark = themeContext === "dark"

  useHeader({
    leftIcon: "back",
    title: "Invite Friends",
    onLeftPress: () => {
      router.back()
    },
  })

  // Memoize themed styles
  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])
  const $themedItemContainer = useMemo(() => themed($itemContainer), [themed])
  const $themedIconContainer = useMemo(() => themed($iconContainer), [themed])
  const $themedTextContainer = useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = useMemo(() => themed($itemDescription), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.replace("../invitation/add-email")}
        >
          <View style={$themedIconContainer}>
            <Icon icon="mail" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Invite by Email" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Send an invitation directly to their email"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.replace("../invitation/add-link")}
        >
          <View style={$themedIconContainer}>
            <Image source={link} style={{ width: 50, height: 50 }} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Invite by Shared Link" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Create a shareable link for anyone to join"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.xl,
})

const $listContainer: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  marginHorizontal: theme.spacing.lg,
  borderRadius: theme.spacing.md,
})

const $itemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.background,
  minHeight: 80,
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.md,
  borderRadius: 24,
})

const $textContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  marginRight: theme.spacing.sm,
})

const $itemTitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  marginBottom: theme.spacing.xs,
})

const $itemDescription: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 14,
})
