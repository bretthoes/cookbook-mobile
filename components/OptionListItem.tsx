import { Icon, type IconTypes } from "@/components/Icon"
import { Text } from "@/components/Text"
import { colors } from "@/theme"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useMemo } from "react"
import {
  Image,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const CARET_SIZE = 26

export interface OptionListItemProps {
  title: string
  description: string
  onPress: () => void
  /** Icon name when using Icon component for the left side */
  leftIcon?: IconTypes
  /** Image source when using Image for the left side (e.g. require("./link.png")) */
  leftImage?: ImageSourcePropType
}

export function OptionListItem({
  title,
  description,
  onPress,
  leftIcon,
  leftImage,
}: OptionListItemProps) {
  const { themeContext, themed } = useAppTheme()
  const isDark = themeContext === "dark"

  const $themedItemContainer = useMemo(() => themed($itemContainer), [themed])
  const $themedIconContainer = useMemo(() => themed($iconContainer), [themed])
  const $themedTextContainer = useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = useMemo(() => themed($itemDescription), [themed])

  const hasLeftContent = leftIcon ?? leftImage
  if (!hasLeftContent) {
    throw new Error("OptionListItem requires either leftIcon or leftImage")
  }

  return (
    <TouchableOpacity style={$themedItemContainer} onPress={onPress}>
      <View style={$themedIconContainer}>
        {leftIcon ? (
          <Icon icon={leftIcon} size={32} color={colors.tint} />
        ) : leftImage ? (
          <Image source={leftImage} style={{ width: 50, height: 50 }} />
        ) : null}
      </View>
      <View style={$themedTextContainer}>
        <Text preset="subheading" text={title} style={$themedItemTitle} />
        <Text preset="formHelper" text={description} style={$themedItemDescription} />
      </View>
      <Icon icon="caretRight" size={CARET_SIZE} color={isDark ? colors.border : colors.text} />
    </TouchableOpacity>
  )
}

// #region Styles

export const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.xl,
})

export const $listContainer: ThemedStyle<ViewStyle> = (theme) => ({
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

// #endregion
