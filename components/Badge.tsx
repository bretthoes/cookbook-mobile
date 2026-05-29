import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Text } from "./Text"

interface BadgeProps {
  count: number
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Badge({ count, style, textStyle }: BadgeProps) {
  const { themed } = useAppTheme()

  if (count <= 0) return null

  return (
    <View style={[themed($badge), style]}>
      <Text text={count.toString()} style={[themed($badgeText), textStyle]} size="xxs" />
    </View>
  )
}

const $badge: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.error,
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
})

const $badgeText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
  fontWeight: "bold",
})
