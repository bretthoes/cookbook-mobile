import React from "react"
import { TouchableOpacity, ViewStyle } from "react-native"
import { colors, spacing } from "src/theme"
import { useAppTheme } from "src/utils/useAppTheme"
import { Icon } from "./Icon"

interface MoreButtonProps {
  onPress: () => void
  style?: ViewStyle
  top?: number
}

export function MoreButton({ onPress, style, top = spacing.xl }: MoreButtonProps) {
  const { themeContext } = useAppTheme()
  const isDark = themeContext === "dark"

  return (
    <TouchableOpacity style={[$moreButton, { top }, style]} onPress={onPress}>
      <Icon
        icon="more"
        size={24}
        color={isDark ? colors.background : colors.text}
      />
    </TouchableOpacity>
  )
}

const $moreButton: ViewStyle = {
  position: "absolute",
  right: spacing.md,
  zIndex: 1,
  backgroundColor: colors.transparent,
  borderRadius: spacing.xs,
  padding: spacing.xs,
}
