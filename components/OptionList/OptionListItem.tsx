import { Icon, type IconTypes } from "@/components/Icon"
import { Text } from "@/components/Text"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import type { ImageSourcePropType } from "react-native"
import { useMemo } from "react"
import { Image, TouchableOpacity, View } from "react-native"
import {
  $iconContainer,
  $itemContainer,
  $itemDescription,
  $itemTitle,
  $textContainer,
} from "./optionListStyles"

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
