import React from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "src/components"
import { spacing } from "src/theme"

interface DirectionTextProps {
  ordinal: number
  text: string
}

export const DirectionText = ({ ordinal, text }: DirectionTextProps) => {
  return (
    <View style={{ flexDirection: "row" }}>
      <Text size="xl" style={{ marginRight: spacing.sm }}>{`${ordinal}.`}</Text>
      <Text style={{ flex: 1 }} size="md">
        {text}
      </Text>
    </View>
  )
}
