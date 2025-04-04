import React from "react"
import { ViewStyle, TextStyle, View } from "react-native"
import { Screen, Text, Button } from "./index"
import { colors, spacing } from "../theme"
import { router } from "expo-router"

interface ItemNotFoundProps {
  /**
   * The message to display when the item is not found
   */
  message?: string
  /**
   * The text to display on the button
   */
  buttonText?: string
  /**
   * The action to perform when the button is pressed
   */
  onButtonPress?: () => void
  /**
   * Optional style for the container
   */
  style?: ViewStyle
}

/**
 * A reusable component to display when an item is not found
 */
export function ItemNotFound({
  message = "Item not found",
  buttonText = "Go Back",
  onButtonPress = () => router.back(),
  style,
}: ItemNotFoundProps) {
  return (
    <Screen preset="scroll" style={[$root, style]}>
      <View style={$container}>
        <Text text={message} style={$message} />
        <Button
          text={buttonText}
          onPress={onButtonPress}
          style={$button}
        />
      </View>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $container: ViewStyle = {
  padding: spacing.lg,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $message: TextStyle = {
  textAlign: "center",
  marginBottom: spacing.md,
  color: colors.textDim,
}

const $button: ViewStyle = {
  marginTop: spacing.md,
} 