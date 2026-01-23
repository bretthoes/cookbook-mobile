import React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
import { Text } from "./Text"
import { colors, spacing } from "src/theme"

interface BadgeProps {
  count: number
  style?: ViewStyle
  textStyle?: TextStyle
}

export function Badge({ count, style, textStyle }: BadgeProps) {
  if (count <= 0) return null

  return (
    <View style={[$badge, style]}>
      <Text text={count.toString()} style={[$badgeText, textStyle]} size="xxs" />
    </View>
  )
}

const $badge: ViewStyle = {
  backgroundColor: colors.error,
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 4,
}

const $badgeText: TextStyle = {
  color: colors.background,
  fontWeight: "bold",
}
