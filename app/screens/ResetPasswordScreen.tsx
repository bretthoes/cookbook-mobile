import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { TextInput, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "app/components"
import { useStores } from "app/models"
import { colors, spacing } from "app/theme"
import { useNavigation } from "@react-navigation/native"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface ResetPasswordScreenProps extends AppStackScreenProps<"ResetPassword"> {}

export const ResetPasswordScreen: FC<ResetPasswordScreenProps> = observer(function ResetPasswordScreen() {
  const {
      authenticationStore: {
        authEmail,
        resetPassword,
        result,
        setResult,
        setAuthEmail
      }
    } = useStores()

  const [resetCode, setResetCode] = useState("")
  const authPasswordInput = useRef<TextInput>(null)
  const [password, setPassword] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)

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

  const passwordError = isSubmitted ? passwordValidationError : "";

  async function authenticate() {
    setIsSubmitted(true)

    if (passwordValidationError) return

    await resetPassword(resetCode, password)

    // If successful, reset the fields
    setIsSubmitted(false)
    setPassword("")

  }

  const handlePressBackToLogin = () => {
    navigation.push("Login")
  }

  useEffect(() => {
        // Return a "cleanup" function that React will run when the component unmounts
        return () => {
          setResult("")
          setPassword("")
        }
      }, [setAuthEmail])

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

  const navigation = useNavigation<AppStackScreenProps<"ResetPassword">["navigation"]>()
  return (
    <Screen
      contentContainerStyle={$root}
      preset="auto"
      safeAreaEdges={["top", "bottom"]}
    >
      <Text text="Reset your password" preset="heading" />
      <Text>We've sent a reset link to</Text>
      <Text weight="bold">{authEmail}</Text>
      <Text>Please check your inbox and fill out the form below.</Text>

      <TextField
        value={resetCode}
        onChangeText={setResetCode}
        containerStyle={{marginBottom: spacing.lg }}
        autoCapitalize="none"
        autoCorrect={false}
        label="Reset code"
        placeholder="Paste reset code here"
        onSubmitEditing={() => authPasswordInput.current?.focus()}
      />

      <TextField
        ref={authPasswordInput}
        value={password}
        onChangeText={setPassword}
        containerStyle={{marginBottom: spacing.lg }}
        autoCapitalize="none"
        autoComplete="password"
        autoCorrect={false}
        secureTextEntry={isPasswordHidden}
        labelTx="loginScreen.passwordFieldLabel"
        placeholderTx="loginScreen.passwordFieldPlaceholder"
        onSubmitEditing={authenticate}
        RightAccessory={PasswordRightAccessory}
        helper={passwordError}
        status={passwordError ? "error" : undefined}
      />

      <Text text={`${result}`} preset="formHelper" />

      <Button
        testID="Update password"
        text="Update password"
        style={$tapButton}
        preset="reversed"
        onPress={authenticate}
      />

      <Button
        testID="login-button"
        text="Back to login"
        style={$tapButton}
        preset="reversed"
        onPress={handlePressBackToLogin}
      />
      
    </Screen>
  )
})

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
  marginBottom: spacing.xs
}


const $root: ViewStyle = {
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.lg,
}