import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import {
  Button,
  Divider,
  Icon,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
  UseCase,
} from "../components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "../theme"
import { router } from "expo-router"

export default observer(function Login(_props) {
  const authPasswordInput = useRef<TextInput>(null)

  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const {
    authenticationStore: {
      login,
      authEmail,
      setAuthEmail,
      validationError,
      result,
      setResult,
      isAuthenticated,
    },
  } = useStores()

  useEffect(() => {
    // Here is where you could fetch credentials from keychain or storage
    // and pre-fill the form fields.
    setResult("")
    setAuthEmail("")
    setAuthPassword("")

    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      setResult("")
      setAuthPassword("")
      setAuthEmail("")
    }
  }, [setAuthEmail])

  // Add effect to handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      setIsSubmitted(false)
      router.replace("/cookbooks")
    }
  }, [isAuthenticated])

  const error = isSubmitted ? validationError : ""

  async function authenticate() {
    setIsSubmitted(true)
    setAttemptsCount(attemptsCount + 1)

    if (validationError) return

    // Make a request to your server to get an authentication token.
    await login(authPassword)
  }

  const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
    () =>
      function PasswordRightAccessory(props: TextFieldAccessoryProps) {
        return (
          <Icon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.text}
            containerStyle={props.style}
            size={20}
            onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
          />
        )
      },
    [isAuthPasswordHidden],
  )

  return (
    <Screen preset="scroll" style={$root} safeAreaEdges={["top", "bottom"]}>
      <View style={$content}>
        <Text testID="login-heading" tx="loginScreen:logIn" preset="heading" />
        <Text tx="loginScreen:enterDetails" preset="subheading" style={$enterDetails} />
        {attemptsCount > 2 && <Text tx="loginScreen:hint" size="sm" weight="light" style={$hint} />}
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

        <View
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
        >
          <Text text="Password" preset="formLabel" />
          <Text
            text="Forgot Password?"
            style={$forgotPasswordInline}
            onPress={() => router.push("/forgot-password")}
          />
        </View>
        <TextField
          ref={authPasswordInput}
          value={authPassword}
          onChangeText={setAuthPassword}
          autoCapitalize="none"
          autoComplete="password"
          autoCorrect={false}
          secureTextEntry={isAuthPasswordHidden}
          // labelTx="loginScreen.passwordFieldLabel"
          placeholderTx="loginScreen:passwordFieldPlaceholder"
          onSubmitEditing={authenticate}
          RightAccessory={PasswordRightAccessory}
        />

        <Text text={`${result}`} preset="formHelper" style={$result} />
      </UseCase>

      <View style={$content}>
        <Button
          testID="login-button"
          tx="loginScreen:tapToLogIn"
          style={$tapButton}
          preset="reversed"
          onPress={authenticate}
        />

        <Text
          text="No account? Register"
          style={$register}
          onPress={() => router.push("/register")}
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

const $result: TextStyle = {
  color: colors.error,
}

const $enterDetails: TextStyle = {
  marginBottom: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.md,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs,
}

const $register: TextStyle = {
  fontSize: spacing.md,
  textDecorationLine: "underline",
}
const $forgotPasswordInline: TextStyle = {
  fontSize: spacing.sm,
  textDecorationLine: "underline",
}
