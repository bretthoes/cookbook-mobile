import { Button } from "@/components/Button"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Divider } from "@/components/Divider"
import { FormCard } from "@/components/FormCard"
import { PressableIcon } from "@/components/Icon"
import { PasswordRequirements } from "@/components/PasswordRequirements"
import { Screen } from "@/components/Screen"
import { StepIndicator } from "@/components/StepIndicator"
import { Text } from "@/components/Text"
import { TextField, TextFieldAccessoryProps } from "@/components/TextField"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { useEmailVerificationPolling } from "@/hooks/useEmailVerificationPolling"
import { colors, spacing } from "@/theme"
import * as SecureStore from "expo-secure-store"
import { useHeader } from "@/utils/useHeader"
import { router, useNavigation } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  LayoutAnimation,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

const TOTAL_STEPS = 4
const SUCCESS_DELAY_MS = 1000
const isValidDisplayName = (input: string) => /^[\p{L}\p{M} \-']+$/u.test(input)

export default observer(function Register() {
  const authPasswordInput = useRef<TextInput>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [password, setPassword] = useState("")
  const [localDisplayName, setLocalDisplayName] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isCooldown, setIsCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [verificationEmail, setVerificationEmail] = useState("")

  const {
    authenticationStore: {
      register,
      login,
      resendConfirmationEmail,
      authEmail,
      setAuthEmail,
      setDisplayName,
      updateDisplayName,
      validationError,
      result,
      setResult,
    },
  } = useStores()

  const advanceStep = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCurrentStep((s) => Math.min(s + 1, 5))
  }, [])

  useEmailVerificationPolling(currentStep === 3, advanceStep)

  useEffect(() => {
    if (currentStep === 3 && !verificationEmail) {
      if (authEmail) {
        setVerificationEmail(authEmail)
      } else {
        SecureStore.getItemAsync("email").then((e) => e && setVerificationEmail(e))
      }
    }
  }, [currentStep, authEmail, verificationEmail])

  useEffect(() => {
    return () => {
      setResult("")
    }
  }, [setResult])

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

  const displayNameError = useMemo(() => {
    if (localDisplayName.length === 0) return translate("setDisplayNameScreen:validation.cantBeBlank")
    if (localDisplayName.length > 60) return translate("setDisplayNameScreen:validation.tooLong60")
    if (!isValidDisplayName(localDisplayName))
      return translate("setDisplayNameScreen:validation.invalidChars")
    return ""
  }, [localDisplayName])

  const emailError = isSubmitted ? validationError : ""
  const passwordError = isSubmitted ? passwordValidationError : ""
  const displayNameValidationError = isSubmitted ? displayNameError : ""

  const handleEmailStepSubmit = () => {
    setIsSubmitted(true)
    if (validationError) return
    advanceStep()
    setIsSubmitted(false)
  }

  const handlePasswordStepSubmit = async () => {
    setIsSubmitted(true)
    if (passwordValidationError) return
    const success = await register(password)
    if (success) {
      setPassword("")
      setVerificationEmail(authEmail)
      advanceStep()
    }
    setIsSubmitted(false)
  }

  const handleVerify = async () => {
    setIsVerifying(true)
    setErrorMessage("")
    setResult("")

    // Ensure store has email for login API — it may have been cleared (e.g. rehydration)
    if (!authEmail) {
      const emailToUse = verificationEmail || (await SecureStore.getItemAsync("email"))
      if (emailToUse) setAuthEmail(emailToUse)
    }

    const storedPassword = await SecureStore.getItemAsync("password")
    const loginSuccess = await login(storedPassword ?? "", true, true)
    if (loginSuccess) {
      advanceStep()
    } else {
      setErrorMessage(translate("emailVerificationScreen:notYetVerified"))
    }
    setIsVerifying(false)
  }

  const handleResendEmail = () => {
    if (isCooldown) return
    resendConfirmationEmail()
    setErrorMessage("")
    setIsCooldown(true)
    setCooldownTime(60)
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

  const handleStep3Continue = async () => {
    setIsSubmitted(true)
    if (displayNameError) return
    setDisplayName(localDisplayName.trim())
    const success = await updateDisplayName()
    if (success) {
      advanceStep()
    }
    setIsSubmitted(false)
  }

  const handleBack = () => {
    if (currentStep === 1) {
      router.back()
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setCurrentStep((s) => Math.max(s - 1, 1))
    }
  }

  useEffect(() => {
    if (currentStep === 5) {
      const t = setTimeout(() => {
        router.replace("/(logged-in)/(tabs)/cookbooks")
      }, SUCCESS_DELAY_MS)
      return () => clearTimeout(t)
    }
  }, [currentStep])

  const navigation = useNavigation()

  const headerTitle =
    currentStep === 1
      ? "registerScreen:emailStepTitle"
      : currentStep === 2
        ? "registerScreen:passwordStepTitle"
        : "registerScreen:title"

  useEffect(() => {
    if (currentStep === 5) {
      navigation.setOptions({ headerShown: false })
    } else {
      navigation.setOptions({ headerShown: true })
    }
  }, [currentStep, navigation])

  useHeader(
    {
      titleTx: headerTitle,
      leftIcon: "back",
      onLeftPress: handleBack,
      ...(currentStep === 3 && {
        rightTx: "emailVerificationScreen:iveVerified",
        onRightPress: handleVerify,
      }),
      ...(currentStep === 4 && {
        rightTx: "setDisplayNameScreen:continue",
        onRightPress: handleStep3Continue,
      }),
    },
    [currentStep, localDisplayName],
  )

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

  if (currentStep === 5) {
    return (
      <LoadingScreen text={translate("registerScreen:gettingReady")} />
    )
  }

  return (
    <Screen preset="scroll" style={$root} safeAreaEdges={["top", "bottom"]}>
      <View style={$content}>
        <Text tx="registerScreen:subtitle" preset="subheading" style={$subtitle} />
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </View>

      {currentStep === 1 && (
        <>
          <FormCard>
            <TextField
              value={authEmail}
              onChangeText={setAuthEmail}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              labelTx="registerScreen:emailFieldLabel"
              placeholderTx="registerScreen:emailPlaceholder"
              helper={emailError}
              status={emailError ? "error" : undefined}
              onSubmitEditing={handleEmailStepSubmit}
            />
          </FormCard>
          <View style={$content}>
            <Button
              testID="register-email-button"
              tx="common:next"
              style={$tapButton}
              preset="reversed"
              onPress={handleEmailStepSubmit}
            />
            <Text
              tx="registerScreen:alreadyHaveAccount"
              style={$register}
              onPress={() => router.push("/log-in")}
            />
          </View>
        </>
      )}

      {currentStep === 2 && (
        <>
          <FormCard>
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
              RightAccessory={PasswordRightAccessory}
              helper={passwordError}
              status={passwordError ? "error" : undefined}
              onSubmitEditing={handlePasswordStepSubmit}
            />
            <PasswordRequirements password={password} />
            <Text text={`${result}`} preset="formHelper" />
          </FormCard>
          <View style={$content}>
            <Button
              testID="register-button"
              tx="common:next"
              style={$tapButton}
              preset="reversed"
              onPress={handlePasswordStepSubmit}
            />
            <Text
              tx="registerScreen:alreadyHaveAccount"
              style={$register}
              onPress={() => router.push("/log-in")}
            />
          </View>
        </>
      )}

      {currentStep === 3 && (
        <>
          <FormCard>
            <Text tx="emailVerificationScreen:sentToPrefix" preset="formHelper" />
            <Text weight="bold">{verificationEmail || authEmail}</Text>
            <Divider />
            <Text tx="emailVerificationScreen:sentToSuffix" preset="formHelper" />
            <Text tx="emailVerificationScreen:returnHereHint" preset="formHelper" style={$hint} />
            {result && !errorMessage ? (
              <Text text={result} preset="formHelper" style={$formHelper} />
            ) : null}
            {isVerifying && (
              <React.Fragment>
                <Divider style={{ marginVertical: spacing.xs }} />
                <Text tx="emailVerificationScreen:verifying" preset="formHelper" />
              </React.Fragment>
            )}
            {errorMessage ? (
              <Text text={errorMessage} preset="formHelper" style={$errorText} />
            ) : null}
          </FormCard>
          <View style={$content}>
            <Button
              tx="emailVerificationScreen:iveVerified"
              preset="reversed"
              onPress={handleVerify}
              disabled={isVerifying}
              style={$tapButton}
            />
            <Button
              tx={!isCooldown ? "emailVerificationScreen:resendButton" : undefined}
              text={
                isCooldown
                  ? translate("emailVerificationScreen:resendCooldown", { seconds: cooldownTime })
                  : undefined
              }
              preset="default"
              onPress={handleResendEmail}
              disabled={isCooldown}
              style={$resendButton}
            />
          </View>
        </>
      )}

      {currentStep === 4 && (
        <>
          <FormCard>
            <Text tx="setDisplayNameScreen:description" preset="formHelper" style={$hint} />
            <TextField
              value={localDisplayName}
              onChangeText={setLocalDisplayName}
              helper={displayNameValidationError}
              status={displayNameValidationError ? "error" : undefined}
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect={false}
              labelTx="setDisplayNameScreen:label"
              placeholderTx="setDisplayNameScreen:placeholder"
              onSubmitEditing={handleStep3Continue}
            />
          </FormCard>
          <View style={$content}>
            <Button
              tx="setDisplayNameScreen:continue"
              preset="reversed"
              onPress={handleStep3Continue}
              style={$tapButton}
            />
          </View>
        </>
      )}
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $content: ViewStyle = {
  paddingHorizontal: spacing.md,
  marginTop: spacing.md,
}

const $subtitle: TextStyle = {
  marginBottom: spacing.sm,
}

const $tapButton: ViewStyle = {
  marginBottom: spacing.sm,
}

const $resendButton: ViewStyle = {
  marginBottom: spacing.sm,
}

const $register: TextStyle = {
  textDecorationLine: "underline",
}

const $hint: TextStyle = {
  marginTop: spacing.sm,
}

const $formHelper: TextStyle = {
  color: colors.error,
  marginTop: spacing.xs,
}

const $errorText: TextStyle = {
  color: colors.error,
  marginTop: spacing.xs,
}
