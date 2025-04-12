import React, { useMemo } from "react"
import { ViewStyle, TextStyle, View } from "react-native"
import { Screen, Text, Button } from "./index"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
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
  const { themed } = useAppTheme()

  const $themedRoot = useMemo(() => themed($root), [themed])
  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedMessage = useMemo(() => themed($message), [themed])
  const $themedButton = useMemo(() => themed($button), [themed])

  return (
    <Screen preset="scroll" style={[$themedRoot, style]}>
      <View style={$themedContainer}>
        <Text text={message} style={$themedMessage} />
        <Button text={buttonText} onPress={onButtonPress} style={$themedButton} />
      </View>
    </Screen>
  )
}

const $root: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.lg,
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
})

const $message: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  marginBottom: theme.spacing.md,
  color: theme.colors.textDim,
})

const $button: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
})
