import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import type { TxKeyPath } from "@/i18n"
import { getAuthEmailValidationError, useAuthStore } from "@/stores/authStore"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { router } from "expo-router"
import React, { useEffect, useState } from "react"
import { TextStyle, ViewStyle } from "react-native"

export default function ForgotPassword() {
  const { themed } = useAppTheme()
  const authEmail = useAuthStore((s) => s.authEmail)
  const result = useAuthStore((s) => s.result)
  const setResult = useAuthStore((s) => s.setResult)
  const setAuthEmail = useAuthStore((s) => s.setAuthEmail)
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const validationError = getAuthEmailValidationError(authEmail)
  const { isInFlight, run } = useInFlightAction()

  const [isSubmitted, setIsSubmitted] = useState(false)

  const error = isSubmitted ? validationError : ""

  // Drop any message left over from the login screen.
  useEffect(() => {
    setResult("")
  }, [setResult])

  function sendForgotPasswordEmail() {
    run(async () => {
      setIsSubmitted(true)
      if (validationError) return
      setIsSubmitted(false)
      const sent = await forgotPassword()
      if (sent) router.push("../reset-password")
    })
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

      {result ? (
        <Text tx={result as TxKeyPath} preset="formHelper" style={themed($errorText)} />
      ) : null}

      <Button
        tx="forgotPasswordScreen:sendButton"
        onPress={sendForgotPasswordEmail}
        disabled={isInFlight}
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

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
})
