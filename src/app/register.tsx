import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { useNavigation } from "@react-navigation/native"
import { colors, spacing } from "src/theme"
import { TextInput, TextStyle, ViewStyle } from "react-native"
import { router } from "expo-router/build/imperative-api"

export default observer(function Register() {
  const authPasswordInput = useRef<TextInput>(null)
  const [password, setPassword] = useState("")

  // Password validation (handled locally)
  const passwordValidationError = useMemo(() => {
    if (password.length === 0) return "can't be blank"
    if (password.length < 6) return "must be at least 6 characters"
    if (password.length > 30) return "cannot exceed 30 characters"
    if (!/[A-Z]/.test(password)) return "must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "must contain at least one lowercase letter"
    if (!/\d/.test(password)) return "must contain at least one digit"
    if (!/[^A-Za-z0-9]/.test(password)) return "must contain at least one special character"
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
  }, [setAuthEmail])

  const error = isSubmitted ? validationError : ""
  const passwordError = isSubmitted ? passwordValidationError : ""

  async function authenticate() {
    setIsSubmitted(true)

    if (validationError || passwordValidationError) return

    await register(password)

    // If successful, reset the fields
    setIsSubmitted(false)
    setPassword("")

    router.push("/set-display-name")
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isPasswordHidden ? "view" : "hidden"}
            color={colors.palette.neutral800}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsPasswordHidden(!isPasswordHidden)}
          />
        )
      },
    [isPasswordHidden],
  )

  return (
    <Screen
      preset="auto"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["top", "bottom"]}
    >
      <Text testID="login-heading" text="Register" preset="heading" style={$logIn} />
      <Text
        text="Enter your details below to create a new account."
        preset="subheading"
        style={$enterDetails}
      />
      {<Text tx="loginScreen:hint" size="sm" weight="light" style={$hint} />}

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
        onSubmitEditing={() => authPasswordInput.current?.focus()}
      />

      <TextField
        ref={authPasswordInput}
        value={password}
        onChangeText={setPassword}
        containerStyle={$textField}
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
        testID="login-button"
        text="Start cookin'"
        style={$tapButton}
        preset="reversed"
        onPress={authenticate}
      />

      <Text
        text="Already have an account? Login"
        style={$register}
        onPress={() => router.push("/log-in")}
      />
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $logIn: TextStyle = {
  marginBottom: spacing.sm,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.md,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
}

const $register: TextStyle = {
  textDecorationLine: "underline",
}
