import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Screen, Text } from "app/components"
import { useStores } from "app/models"
import * as SecureStore from "expo-secure-store"
import { spacing } from "app/theme"

interface EmailVerificationScreenProps extends AppStackScreenProps<"EmailVerification"> {}

export const EmailVerificationScreen: FC<EmailVerificationScreenProps> = observer(function EmailVerificationScreen() {
  const {
    authenticationStore: {
      authEmail,
      login,
      resendConfirmationEmail,
      result
    }
  } = useStores()

  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  async function checkEmailVerified()  {
    setIsVerifying(true)
    setErrorMessage("")

    // if the email has been verified, use password set in
    // secure storage to log in the user to the main app
    await login((await SecureStore.getItemAsync("password")) ?? "")
    setErrorMessage("Your email is not yet verified. Please check your inbox.")

    setIsVerifying(false)
  }
  return (
    <Screen style={$root} preset="scroll">
      <Text>We've sent a confirmation email to</Text>
      <Text>{authEmail}</Text>
      <Text>Please check your inbox and click the verification link.</Text>

      <Button text="Resend Email" onPress={resendConfirmationEmail} />
      <Text text={`${result}`} preset="formHelper" />
      <Button text="I have verified my email" onPress={checkEmailVerified} />
      
      {isVerifying && <ActivityIndicator />}
      {errorMessage ? <Text style={{ color: "red" }}>{errorMessage}</Text> : null}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  marginTop: spacing.xxxl
}
