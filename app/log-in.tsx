import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { PressableIcon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField, TextFieldAccessoryProps } from "@/components/TextField"
import { Checkbox } from "@/components/Toggle"
import { UseCase } from "@/components/UseCase"
import { useStores } from "@/models/helpers/useStores"
import { router } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo, useRef, useState } from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "../theme"

const REMEMBER_ME_EMAIL_KEY = "login_remember_email"
const REMEMBER_ME_PASSWORD_KEY = "login_remember_password"

export default observer(function Login(_props) {
  const authPasswordInput = useRef<TextInput>(null)
  const hasLoadedCredentials = useRef(false)

  const [authPassword, setAuthPassword] = useState("")
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [attemptsCount, setAttemptsCount] = useState(0)
  const [rememberMe, setRememberMe] = useState(true)
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
    setResult("")
    // Load saved credentials from secure store
    if (!hasLoadedCredentials.current) {
      hasLoadedCredentials.current = true
      const loadStoredCredentials = async () => {
        try {
          const storedEmail = await SecureStore.getItemAsync(REMEMBER_ME_EMAIL_KEY)
          const storedPassword = await SecureStore.getItemAsync(REMEMBER_ME_PASSWORD_KEY)
          if (storedEmail) setAuthEmail(storedEmail)
          if (storedPassword) setAuthPassword(storedPassword)
        } catch {
          // Ignore - secure store may not be available (e.g. web)
        }
      }
      loadStoredCredentials()
    }

    return () => {
      setResult("")
      // Don't clear email/password, preserves form when login fails so user doesn't have to re-enter
    }
  }, [setAuthEmail, setResult])

  // Add effect to handle authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      const persistCredentials = async () => {
        try {
          if (rememberMe) {
            await SecureStore.setItemAsync(REMEMBER_ME_EMAIL_KEY, authEmail)
            await SecureStore.setItemAsync(REMEMBER_ME_PASSWORD_KEY, authPassword)
          } else {
            await SecureStore.deleteItemAsync(REMEMBER_ME_EMAIL_KEY)
            await SecureStore.deleteItemAsync(REMEMBER_ME_PASSWORD_KEY)
          }
        } catch {
          // Ignore - secure store may not be available
        }
      }
      persistCredentials()
      setIsSubmitted(false)
      router.replace("/(logged-in)/(tabs)/cookbooks")
    }
  }, [isAuthenticated, rememberMe, authEmail, authPassword])

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
          <PressableIcon
            icon={isAuthPasswordHidden ? "view" : "hidden"}
            color={colors.text}
            containerStyle={props.style as ViewStyle}
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
          <Text tx="loginScreen:passwordFieldLabel" preset="formLabel" />
          <Text
            tx="loginScreen:passwordForgot"
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
        <View style={$rememberMeRow}>
          <Checkbox
            value={rememberMe}
            onValueChange={setRememberMe}
            labelTx="loginScreen:rememberMe"
          />
        </View>
        <Button
          testID="login-button"
          tx="loginScreen:tapToLogIn"
          style={$tapButton}
          preset="reversed"
          onPress={authenticate}
        />

        <Text
          tx="loginScreen:register"
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

const $rememberMeRow: ViewStyle = {
  marginBottom: spacing.sm,
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
