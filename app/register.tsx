import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, TextFieldAccessoryProps } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { colors, spacing } from "@/theme"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"

export default observer(function Register() {
  const authPasswordInput = useRef<TextInput>(null)
  const [password, setPassword] = useState("")

  // Password validation (handled locally)
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

  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    authenticationStore: { register, authEmail, setAuthEmail, validationError, result, setResult },
  } = useStores()

  useEffect(() => {
    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      setResult("")
      setPassword("")
    }
  }, [setAuthEmail, setResult])

  const error = isSubmitted ? validationError : ""
  const passwordError = isSubmitted ? passwordValidationError : ""

  async function authenticate() {
    setIsSubmitted(true)

    if (validationError || passwordValidationError) return

    const success = await register(password)
    if (success) {
      setPassword("")
      router.push("/set-display-name")
    }
    setIsSubmitted(false)
  }

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

  return (
    <Screen preset="auto" style={$root} safeAreaEdges={["top", "bottom"]}>
      <View style={$content}>
        <Text testID="login-heading" tx="registerScreen:title" preset="heading" />
        <Text
          tx="registerScreen:subtitle"
          preset="subheading"
          style={$enterDetails}
        />
      </View>

      <UseCase>
        <TextField
          value={authEmail}
          onChangeText={setAuthEmail}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          labelTx="loginScreen:emailFieldLabel"
          placeholderTx="loginScreen:emailFieldPlaceholder"
          helper={error}
          status={error ? "error" : undefined}
          onSubmitEditing={() => authPasswordInput.current?.focus()}
        />
        <Divider style={{ marginVertical: spacing.xxs }} />
        <TextField
          ref={authPasswordInput}
          value={password}
          onChangeText={setPassword}
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
      </UseCase>

      <View style={$content}>
        <Button
          testID="register-button"
          tx="registerScreen:tapToRegister"
          style={$tapButton}
          preset="reversed"
          onPress={authenticate}
        />

        <Text
          tx="registerScreen:alreadyHaveAccount"
          style={$register}
          onPress={() => router.push("/log-in")}
        />
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  marginTop: spacing.xl,
  paddingHorizontal: spacing.md,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginBottom: spacing.sm,
}

const $register: TextStyle = {
  textDecorationLine: "underline",
}
