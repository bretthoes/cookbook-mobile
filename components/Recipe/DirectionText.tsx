import { Text } from "@/components/Text"
import { spacing } from "@/theme"
import React from "react"
import { View } from "react-native"

interface DirectionTextProps {
  ordinal: number
  text: string
  completed?: boolean
}

export const DirectionText = ({ ordinal, text, completed }: DirectionTextProps) => {
  const textStyle = completed
    ? { textDecorationLine: "line-through" as const, fontWeight: "300" as const }
    : undefined
  return (
    <View style={{ flexDirection: "row" }}>
      <Text
        size="xl"
        style={[{ marginRight: spacing.sm }]}
      >
        {`${ordinal}.`}
      </Text>
      <Text style={[{ flex: 1 }, textStyle]} size="md">
        {text}
      </Text>
    </View>
  )
}
