import React, { ComponentType, FC, useEffect, useMemo, useRef, useState } from "react"
import { observer } from "mobx-react-lite"
import { AppStackScreenProps } from "app/navigators"
import { Button, Icon, Screen, Text, TextField, TextFieldAccessoryProps } from "app/components"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
import { colors, spacing } from "app/theme"
import { TextInput, TextStyle, ViewStyle } from "react-native"

interface RegisterScreenProps extends AppStackScreenProps<"Register"> {}

export const RegisterScreen: FC<RegisterScreenProps> = observer(function RegisterScreen() {
  const authPasswordInput = useRef<TextInput>(null)
  const [authPassword, setAuthPassword] = useState("")

  // Password validation (handled locally)
  const passwordValidationError = useMemo(() => {
    if (authPassword.length === 0) return "can't be blank"
    if (authPassword.length < 6) return "must be at least 6 characters"
    if (!/[A-Z]/.test(authPassword)) return "must contain at least one uppercase letter"
    if (!/[a-z]/.test(authPassword)) return "must contain at least one lowercase letter"
    if (!/\d/.test(authPassword)) return "must contain at least one digit"
    if (!/[^A-Za-z0-9]/.test(authPassword)) return "must contain at least one special character"
    return ""
}, [authPassword])
  
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    authenticationStore: {
      register,
      authEmail,
      setAuthEmail,
      validationError,
      result,
      setResult,
    },
  } = useStores()
  const navigation = useNavigation<AppStackScreenProps<"Register">["navigation"]>()

  const handlePressLogin = () => {
    navigation.replace("Login")
  }
  
  useEffect(() => {
      // Return a "cleanup" function that React will run when the component unmounts
      return () => {
        setResult("")
        setAuthPassword("")
        setAuthEmail("")
      }
    }, [setAuthEmail])

    const error = isSubmitted ? validationError : ""
    const passwordError = isSubmitted ? passwordValidationError : "";


    async function authenticate() {
      setIsSubmitted(true)
  
      if (validationError || passwordValidationError) return
  
      await register(authPassword)
  
      // If successful, reset the fields
      setIsSubmitted(false)
      setAuthPassword("")
      setAuthEmail("")

      // navigate to email verification screen
      navigation.replace("EmailVerification")
    }

    const PasswordRightAccessory: ComponentType<TextFieldAccessoryProps> = useMemo(
        () =>
          function PasswordRightAccessory(props: TextFieldAccessoryProps) {
            return (
              <Icon
                icon={isAuthPasswordHidden ? "view" : "hidden"}
                color={colors.palette.neutral800}
                containerStyle={props.style}
                size={20}
                onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
              />
            )
          },
        [isAuthPasswordHidden],
      )

  return (
    <Screen
          preset="auto"
          contentContainerStyle={$screenContentContainer}
          safeAreaEdges={["top", "bottom"]}
        >
          <Text testID="login-heading" text="Register" preset="heading" style={$logIn} />
          <Text text="Enter your details below to get started." preset="subheading" style={$enterDetails} />
          {<Text tx="loginScreen.hint" size="sm" weight="light" style={$hint} />}
    
          <TextField
            value={authEmail}
            onChangeText={setAuthEmail}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            labelTx="loginScreen.emailFieldLabel"
            placeholderTx="loginScreen.emailFieldPlaceholder"
            helper={error}
            status={error ? "error" : undefined}
            onSubmitEditing={() => authPasswordInput.current?.focus()}
          />
    
          <TextField
            ref={authPasswordInput}
            value={authPassword}
            onChangeText={setAuthPassword}
            containerStyle={$textField}
            autoCapitalize="none"
            autoComplete="password"
            autoCorrect={false}
            secureTextEntry={isAuthPasswordHidden}
            labelTx="loginScreen.passwordFieldLabel"
            placeholderTx="loginScreen.passwordFieldPlaceholder"
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
    
          <Text text="Already have an account? Login" style={$register} onPress={handlePressLogin} />
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
      marginBottom: spacing.xs
    }
    
    const $register: TextStyle = {}
    