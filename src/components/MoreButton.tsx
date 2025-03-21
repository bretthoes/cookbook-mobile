import React from "react"
import { TouchableOpacity, ViewStyle } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors, spacing } from "src/theme"
import { useAppTheme } from "src/utils/useAppTheme"

interface MoreButtonProps {
  onPress: () => void
  style?: ViewStyle
  top?: number
}

export function MoreButton({ onPress, style, top = spacing.xl }: MoreButtonProps) {
  const { themeContext } = useAppTheme()
  const isDark = themeContext === "dark"

  return (
    <TouchableOpacity 
      style={[
        $moreButton,
        { top },
        style
      ]} 
      onPress={onPress}
    >
      <Ionicons 
        name="ellipsis-vertical" 
        size={24} 
        color={isDark ? colors.palette.neutral200 : colors.palette.neutral800} 
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