import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, TextStyle, ViewStyle, TouchableOpacity } from "react-native"
import { Button, Screen, Text } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import * as SecureStore from "expo-secure-store"
import { colors, spacing } from "src/theme"
import { router } from "expo-router"

export default observer(function EmailVerification() {
  const {
    authenticationStore: { authEmail, login, resendConfirmationEmail, result },
  } = useStores()

  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCooldown, setIsCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  async function checkEmailVerified() {
    setIsVerifying(true)
    setErrorMessage("")

    // if the email has been verified, use password set in
    // secure storage to log in the user to the main app
    var result = await login((await SecureStore.getItemAsync("password")) ?? "", true)
    console.log("checkEmailVerified", result)
    if (result) {
      router.replace("/log-in")
    } else {
      setErrorMessage("Your email is not yet verified. Please check your inbox.")
    }
    setIsVerifying(false)
  }

  function handleResendEmail() {
    if (isCooldown) return

    resendConfirmationEmail()
    setIsCooldown(true)
    setCooldownTime(60) // 60 seconds

    const timer = setInterval(() => {
      setCooldownTime((prev) => {
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
    <Screen style={$root} preset="auto" safeAreaEdges={["top", "bottom"]}>
      <Text text="Confirm your account" preset="heading" />
      <Text>We've sent a confirmation email to</Text>
      <Text weight="bold">{authEmail}</Text>
      <Text>Please check your inbox and click the verification link.</Text>

      <Text text={`${result}`} preset="formHelper" style={$formHelper} />

      <Button text="I have verified my email" onPress={checkEmailVerified} style={$tapButton} />

      {isVerifying && <ActivityIndicator />}
      {errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}

      <TouchableOpacity 
        onPress={handleResendEmail} 
        disabled={isCooldown}
        style={$resendContainer}
      >
        <Text 
          style={[
            $resendText,
            isCooldown && { color: colors.border }
          ]}
        >
          {isCooldown 
            ? `Didn't get the email? Click here to resend (${cooldownTime}s)`
            : "Didn't get the email? Click here to resend"
          }
        </Text>
      </TouchableOpacity>
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
  color: colors.palette.angry500,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
}

const $resendContainer: ViewStyle = {
  marginTop: spacing.md,
  alignItems: "center",
}

const $resendText: TextStyle = {
  color: colors.tint,
  textDecorationLine: "underline",
}
