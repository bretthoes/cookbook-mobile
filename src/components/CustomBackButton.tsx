import React from "react"
import { TouchableOpacity, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing } from "src/theme"
import { useAppTheme } from "src/utils/useAppTheme"

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
      <Ionicons
        name="arrow-back"
        size={24}
        color={isDark ? colors.background : colors.palette.neutral800}
      />
    </TouchableOpacity>
  )
}

const $moreButton: ViewStyle = {
  position: "absolute",
  left: spacing.md,
  zIndex: 1,
  backgroundColor: colors.transparent,
  borderRadius: spacing.xs,
  padding: spacing.xs,
}

