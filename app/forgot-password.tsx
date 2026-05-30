import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { getAuthEmailValidationError, useAuthStore } from "@/stores/authStore"
import { spacing } from "@/theme"
import { router } from "expo-router"
import React, { useState } from "react"
import { ViewStyle } from "react-native"

export default function ForgotPassword() {
  const authEmail = useAuthStore((s) => s.authEmail)
  const result = useAuthStore((s) => s.result)
  const setAuthEmail = useAuthStore((s) => s.setAuthEmail)
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const validationError = getAuthEmailValidationError(authEmail)

  const [isSubmitted, setIsSubmitted] = useState(false)

  const error = isSubmitted ? validationError : ""

  async function sendForgotPasswordEmail() {
    setIsSubmitted(true)
    if (validationError) return
    setIsSubmitted(false)
    await forgotPassword()
    router.push("../reset-password")
  }

  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top", "bottom"]}>
      <Text tx="forgotPasswordScreen:title" preset="heading" />
      <Text tx="forgotPasswordScreen:subtitle" />

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

      <Button
        tx="forgotPasswordScreen:sendButton"
        onPress={sendForgotPasswordEmail}
        style={$tapButton}
      />
    </Screen>
  )
}

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
