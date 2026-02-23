import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, TextFieldAccessoryProps } from "@/components/TextField"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { colors, spacing } from "@/theme"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, View, ViewStyle } from "react-native"

export default observer(function ResetPassword() {
  const {
    authenticationStore: { authEmail, resetPassword, result, setResult, setAuthEmail },
  } = useStores()

  const [resetCode, setResetCode] = useState("")
  const authPasswordInput = useRef<TextInput>(null)
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const passwordValidationError = useMemo(() => {
    if (password.length === 0) return translate("registerScreen:validation.cantBeBlank")
    if (password.length < 6) return translate("registerScreen:validation.minLength")
    if (password.length > 30) return translate("registerScreen:validation.maxLength")
    if (!/[A-Z]/.test(password)) return translate("registerScreen:validation.needsUppercase")
    if (!/[a-z]/.test(password)) return translate("registerScreen:validation.needsLowercase")
    if (!/\d/.test(password)) return translate("registerScreen:validation.needsDigit")
    if (!/[^A-Za-z0-9]/.test(password))
      return translate("registerScreen:validation.needsSpecialChar")
    return ""
  }, [password])

  const passwordError = isSubmitted ? passwordValidationError : ""

  async function authenticate() {
    setIsSubmitted(true)

    if (passwordValidationError) return

    await resetPassword(resetCode, password)

    // If successful, reset the fields
    setIsSubmitted(false)
    setPassword("")
  }

  useEffect(() => {
    return () => {
      setResult("")
      setPassword("")
    }
  }, [setAuthEmail, setResult])

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <PressableIcon
            icon={isPasswordHidden ? "view" : "hidden"}
            color={colors.text}
            containerStyle={props.style as ViewStyle}
            size={20}
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
          />
        )
      },
    [isPasswordHidden],
  )

  // TODO determine 200 in a less hacky way; just to disable button to prevent multiple reset submits
  const passwordSuccessfullyReset = result === translate("resetPasswordScreen:successMessage")

  return (
    <Screen contentContainerStyle={$root} preset="auto" safeAreaEdges={["top", "bottom"]}>
      <View style={$contentContainer}>
        <Text tx="resetPasswordScreen:title" preset="heading" />
        <Text tx="resetPasswordScreen:sentToPrefix" />
        <Text weight="bold">{authEmail}</Text>
        <Text tx="resetPasswordScreen:sentToSuffix" />

        <TextField
          value={resetCode}
          onChangeText={setResetCode}
          containerStyle={{ marginBottom: spacing.lg }}
          autoCapitalize="none"
          autoCorrect={false}
          labelTx="resetPasswordScreen:resetCodeLabel"
          placeholderTx="resetPasswordScreen:resetCodePlaceholder"
          onSubmitEditing={() => authPasswordInput.current?.focus()}
        />

        <TextField
          ref={authPasswordInput}
          value={password}
          onChangeText={setPassword}
          containerStyle={{ marginBottom: spacing.lg }}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          secureTextEntry={isPasswordHidden}
          labelTx="loginScreen:passwordFieldLabel"
          placeholderTx="loginScreen:passwordFieldPlaceholder"
          onSubmitEditing={authenticate}
          RightAccessory={PasswordRightAccessory}
          helper={passwordError}
          status={passwordError ? "error" : undefined}
        />

        <Text text={`${result}`} preset="formHelper" />

        <Button
          disabled={passwordSuccessfullyReset}
          testID="Update password"
          tx="resetPasswordScreen:updateButton"
          style={$tapButton}
          textStyle={passwordSuccessfullyReset ? { color: colors.border } : undefined}
          preset="reversed"
          onPress={authenticate}
        />
      </View>

      <Button
        testID="login-button"
        tx="resetPasswordScreen:backToLogin"
        style={$loginButton}
        preset="reversed"
        onPress={() => router.push("/log-in")}
      />
    </Screen>
  )
})

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
}

const $root: ViewStyle = {
  flexGrow: 1,
  justifyContent: "space-between",
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $contentContainer: ViewStyle = {
  flexGrow: 1,
}

const $loginButton: ViewStyle = {
  marginBottom: spacing.xxl,
}
