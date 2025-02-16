import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, TextStyle, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import { useStores } from "app/models"
import * as SecureStore from "expo-secure-store"
import { colors, spacing } from "app/theme"

interface EmailVerificationScreenProps extends AppStackScreenProps<"EmailVerification"> {}

export const EmailVerificationScreen: FC<EmailVerificationScreenProps> = observer(function EmailVerificationScreen() {
  const {
    authenticationStore: {
      authEmail,
      login,
      isAuthenticated,
      resendConfirmationEmail,
      result
    }
  } = useStores()

  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCooldown, setIsCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  async function checkEmailVerified()  {
    setIsVerifying(true)
    setErrorMessage("")

    // if the email has been verified, use password set in
    // secure storage to log in the user to the main app
    await login((await SecureStore.getItemAsync("password")) ?? "")
    // delete password from secure storage after verification
    if (isAuthenticated) await SecureStore.deleteItemAsync("password")
    setErrorMessage("Your email is not yet verified. Please check your inbox.")
    setIsVerifying(false)
  }

  function handleResendEmail() {
    if (isCooldown) return

    resendConfirmationEmail()
    setIsCooldown(true)
    setCooldownTime(60) // 60 seconds

    const timer = setInterval(() => {
      setCooldownTime(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsCooldown(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <Screen
      style={$root}
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
    >
      <Text text="Confirm your account" preset="heading" />
      <Text>We've sent a confirmation email to</Text>
      <Text weight="bold">{authEmail}</Text>
      <Text>Please check your inbox and click the verification link.</Text>

      <Button
        text={isCooldown ? `Resend Email (${cooldownTime}s)` : "Resend Email"}
        onPress={handleResendEmail}
        style={$tapButton}
        disabled={isCooldown}
        textStyle={isCooldown ? { color: colors.palette.neutral400 } : undefined} 
      />

      <Text text={`${result}`} preset="formHelper" style={$formHelper} />

      <Button
        text="I have verified my email"
        onPress={checkEmailVerified}
        style={$tapButton}
      />

      {isVerifying && <ActivityIndicator />}
      {errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $formHelper: TextStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
  color: colors.palette.angry500
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs
}
