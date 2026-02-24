import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n"
import type { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { router } from "expo-router"
import React, { useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

interface ItemNotFoundProps {
  /**
   * The message to display when the item is not found (overrides messageTx if both provided)
   */
  message?: string
  /**
   * Translation key for the message (used when message is not provided)
   */
  messageTx?: TxKeyPath
  /**
   * The text to display on the button (overrides buttonTx if both provided)
   */
  buttonText?: string
  /**
   * Translation key for the button text (used when buttonText is not provided)
   */
  buttonTx?: TxKeyPath
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
  message,
  messageTx,
  buttonText,
  buttonTx,
  onButtonPress = () => router.back(),
  style,
}: ItemNotFoundProps) {
  const { themed } = useAppTheme()

  const displayMessage =
    message ?? (messageTx ? translate(messageTx) : translate("itemNotFound:message"))
  const displayButtonText =
    buttonText ?? (buttonTx ? translate(buttonTx) : translate("common:goBack"))

  const $themedRoot = useMemo(() => themed($root), [themed])
  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedMessage = useMemo(() => themed($message), [themed])
  const $themedButton = useMemo(() => themed($button), [themed])

  return (
    <Screen preset="scroll" style={[$themedRoot, style]}>
      <View style={$themedContainer}>
        <Text text={displayMessage} style={$themedMessage} />
        <Button text={displayButtonText} onPress={onButtonPress} style={$themedButton} />
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
