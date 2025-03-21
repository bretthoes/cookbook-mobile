import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { spacing } from "src/theme"
import { router } from "expo-router"

export default observer(function ForgotPassword() {
  const {
    authenticationStore: { authEmail, result, setAuthEmail, forgotPassword, validationError },
  } = useStores()

  const [isSubmitted, setIsSubmitted] = useState(false)

  const error = isSubmitted ? validationError : ""

  async function sendForgotPasswordEmail() {
    setIsSubmitted(true)
    if (validationError) return
    setIsSubmitted(false)
    await forgotPassword()
    router.push("/reset-password")
  }

  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top", "bottom"]}>
      <Text text="Enter your email" preset="heading" />
      <Text>We'll send a message with instructions to reset your password.</Text>

      <TextField
        value={authEmail}
        onChangeText={setAuthEmail}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect={false}
        keyboardType="email-address"
        labelTx="loginScreen:emailFieldLabel"
        placeholderTx="loginScreen:emailFieldPlaceholder"
        helper={error}
        status={error ? "error" : undefined}
      />

      <Text text={`${result}`} preset="formHelper" />

      <Button text="Send me the code!" onPress={sendForgotPasswordEmail} style={$tapButton} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}
