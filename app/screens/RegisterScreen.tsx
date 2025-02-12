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
  const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
      authenticationStore: { register, authEmail, setAuthEmail, validationError },
    } = useStores()
  const navigation = useNavigation<AppStackScreenProps<"Register">["navigation"]>()

  const handlePressLogin = () => {
    navigation.replace("Login")
  }
  
  useEffect(() => {
      // Return a "cleanup" function that React will run when the component unmounts
      return () => {
        setAuthPassword("")
        setAuthEmail("")
      }
    }, [setAuthEmail])

    const error = isSubmitted ? validationError : ""

    async function authenticate() {
      setIsSubmitted(true)
  
      if (validationError) return
  
      // Make a request to your server to get an authentication token.
      await register(authPassword)
  
      // If successful, reset the fields
      setIsSubmitted(false)
      setAuthPassword("")
      setAuthEmail("")
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
          />
    
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
    