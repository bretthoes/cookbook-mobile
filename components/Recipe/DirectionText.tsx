import { Text } from "@/components/Text"
import { spacing } from "@/theme"
import React from "react"
import { View } from "react-native"

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
