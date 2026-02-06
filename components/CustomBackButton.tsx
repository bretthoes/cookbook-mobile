import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import React from "react"
import { TouchableOpacity, ViewStyle } from "react-native"
import { Icon } from "./Icon"

interface CustomBackButtonProps {
  onPress: () => void
  style?: ViewStyle
  top?: number
}

export function CustomBackButton({ onPress, style, top = spacing.xl }: CustomBackButtonProps) {
  const { themeContext } = useAppTheme()
  const isDark = themeContext === "dark"

  return (
    <TouchableOpacity style={[$moreButton, { top }, style]} onPress={onPress}>
      <Icon icon="back" size={24} color={isDark ? colors.background : colors.text} />
    </TouchableOpacity>
  )
}

const $moreButton: ViewStyle = {
  position: "absolute",
  left: spacing.md,
  zIndex: 1,
  backgroundColor: colors.transparent,
  borderRadius: spacing.xs,
  padding: spacing.md,
}
