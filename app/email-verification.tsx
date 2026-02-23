import { Divider } from "@/components/Divider"
import { Header } from "@/components/Header"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UseCase } from "@/components/UseCase"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { colors, spacing } from "@/theme"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, TextStyle, TouchableOpacity, ViewStyle } from "react-native"

export default observer(function EmailVerification() {
  const {
    authenticationStore: { authEmail, login, resendConfirmationEmail, result, setResult },
  } = useStores()

  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCooldown, setIsCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  useEffect(() => {
    return () => {
      setResult("")
    }
  }, [setResult])

  async function checkEmailVerified() {
    setIsVerifying(true)
    setErrorMessage("")

    // if the email has been verified, use password set in
    // secure storage to log in the user to the main app
    const result = await login((await SecureStore.getItemAsync("password")) ?? "", true)
    if (result) {
      router.replace("/log-in")
    } else {
      setErrorMessage(translate("emailVerificationScreen:notYetVerified"))
    }
    setIsVerifying(false)
  }

  function handleResendEmail() {
    if (isCooldown) return

    resendConfirmationEmail()
    setErrorMessage("")
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
    <Screen style={$root} preset="scroll">
      <Header
        leftIcon="back"
        onLeftPress={() => router.back()}
        rightTx="emailVerificationScreen:next"
        onRightPress={checkEmailVerified}
      />
      <Text
        tx="emailVerificationScreen:title"
        preset="subheading"
        style={{ paddingHorizontal: spacing.md }}
      />
      <UseCase>
        <Text tx="emailVerificationScreen:sentToPrefix" />
        <Text weight="bold">{authEmail}</Text>
        <Divider />
        <Text tx="emailVerificationScreen:sentToSuffix" />

        <Text text={`${result}`} preset="formHelper" style={$formHelper} />

        {isVerifying && <ActivityIndicator />}
        {errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}
      </UseCase>

      <TouchableOpacity onPress={handleResendEmail} disabled={isCooldown} style={$resendContainer}>
        <Text style={[$resendText, isCooldown && { color: colors.border }]}>
          {isCooldown
            ? translate("emailVerificationScreen:resendCooldown", { seconds: cooldownTime })
            : translate("emailVerificationScreen:resendPrompt")}
        </Text>
      </TouchableOpacity>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $formHelper: TextStyle = {
  color: colors.error,
}

const $resendContainer: ViewStyle = {
  alignItems: "center",
}

const $resendText: TextStyle = {
  color: colors.tint,
  textDecorationLine: "underline",
}
