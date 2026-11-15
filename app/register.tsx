import { Button } from "@/components/Button"
import { CircularProgressScreen } from "@/components/CircularProgressScreen"
import { Divider } from "@/components/Divider"
import { FormCard } from "@/components/FormCard"
import { PressableIcon } from "@/components/Icon"
import { LanguagePicker } from "@/components/LanguagePicker"
import { PasswordRequirements } from "@/components/PasswordRequirements"
import { Screen } from "@/components/Screen"
import { StepIndicator } from "@/components/StepIndicator"
import { Text } from "@/components/Text"
import { TextField, TextFieldAccessoryProps } from "@/components/TextField"
import { translate, type TxKeyPath } from "@/i18n"
import { getActiveLanguageCode, setAppLanguage, type SupportedLanguageCode } from "@/i18n/language"
import { getAuthEmailValidationError, useAuthStore } from "@/stores/authStore"
import { useEmailVerificationPolling } from "@/hooks/useEmailVerificationPolling"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { storage } from "@/utils/storage"
import { useHeader } from "@/utils/useHeader"
import { usePreventRemove } from "@react-navigation/native"
import { router, useNavigation } from "expo-router"
import React, { ComponentType, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  LayoutAnimation,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

const TOTAL_STEPS = 5
const SUCCESS_DELAY_MS = 1000
const RESEND_SUCCESS_TX: TxKeyPath = "loginScreen:errors.confirmationResent"
const isValidDisplayName = (input: string) => /^[\p{L}\p{M} \-']+$/u.test(input)

export default function Register() {
  const {
    theme: { colors },
    themed,
  } = useAppTheme()
  const authPasswordInput = useRef<TextInput>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [password, setPassword] = useState("")
  const [localDisplayName, setLocalDisplayName] = useState("")
  const [isPasswordHidden, setIsPasswordHidden] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { isInFlight, run } = useInFlightAction()
  const { isInFlight: isResending, run: runResend } = useInFlightAction()
  const [cooldownTime, setCooldownTime] = useState(0)
  const [registeredPassword, setRegisteredPassword] = useState("")
  const [selectedLanguage, setSelectedLanguage] =
    useState<SupportedLanguageCode>(getActiveLanguageCode())

  const register = useAuthStore((s) => s.register)
  const login = useAuthStore((s) => s.login)
  const resendConfirmationEmail = useAuthStore((s) => s.resendConfirmationEmail)
  const authEmail = useAuthStore((s) => s.authEmail)
  const setAuthEmail = useAuthStore((s) => s.setAuthEmail)
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName)
  const result = useAuthStore((s) => s.result)
  const setResult = useAuthStore((s) => s.setResult)
  const validationError = getAuthEmailValidationError(authEmail)
  const isCooldown = cooldownTime > 0

  /** Only moves forward from `fromStep`, so a poll and a button press can't both advance. */
  const advanceFrom = useCallback((fromStep: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCurrentStep((s) => (s === fromStep ? s + 1 : s))
  }, [])

  const handleVerified = useCallback(() => advanceFrom(4), [advanceFrom])

  useEmailVerificationPolling(currentStep === 4, registeredPassword, handleVerified)

  useEffect(() => {
    if (cooldownTime <= 0) return
    const t = setTimeout(() => setCooldownTime((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldownTime])

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
    const trimmed = localDisplayName.trim()
    if (trimmed.length === 0) return translate("setDisplayNameScreen:validation.cantBeBlank")
    if (trimmed.length > 60) return translate("setDisplayNameScreen:validation.tooLong60")
    if (!isValidDisplayName(trimmed))
      return translate("setDisplayNameScreen:validation.invalidChars")
    return ""
  }, [localDisplayName])

  const emailError = isSubmitted ? validationError : ""
  const passwordError = isSubmitted ? passwordValidationError : ""
  const displayNameValidationError = isSubmitted ? displayNameError : ""

  const handleLanguageSelect = useCallback(async (code: SupportedLanguageCode) => {
    await setAppLanguage(code)
    setSelectedLanguage(code)
  }, [])

  const handleLanguageStepSubmit = () => {
    advanceFrom(1)
  }

  const handleEmailStepSubmit = () => {
    setIsSubmitted(true)
    if (validationError) return
    advanceFrom(2)
    setIsSubmitted(false)
  }

  const handlePasswordStepSubmit = useCallback(() => {
    run(async () => {
      setIsSubmitted(true)
      if (passwordValidationError) return
      const success = await register(password)
      if (success) {
        setRegisteredPassword(password)
        setPassword("")
        advanceFrom(3)
      }
      setIsSubmitted(false)
    })
  }, [passwordValidationError, register, password, advanceFrom, run])

  const handleVerify = useCallback(() => {
    run(async () => {
      setResult("")
      const loginSuccess = await login(registeredPassword, true)
      if (loginSuccess) {
        advanceFrom(4)
      } else {
        setResult("emailVerificationScreen:notYetVerified")
      }
    })
  }, [registeredPassword, setResult, login, advanceFrom, run])

  const handleResendEmail = () => {
    runResend(async () => {
      if (isCooldown) return
      const sent = await resendConfirmationEmail()
      if (sent) setCooldownTime(60)
    })
  }

  const handleDisplayNameContinue = useCallback(() => {
    run(async () => {
      setIsSubmitted(true)
      setResult("")
      if (displayNameError) return
      const success = await updateDisplayName(localDisplayName.trim())
      if (success) {
        advanceFrom(5)
      }
      setIsSubmitted(false)
    })
  }, [displayNameError, localDisplayName, updateDisplayName, setResult, advanceFrom, run])

  // Once the account exists, going back to the password step would only re-register the same
  // email. Step 4 returns to the email step so a typo can be fixed; step 5 (already signed in)
  // and the final step have no back.
  const canGoBack = currentStep <= 4
  const handleBack = () => {
    if (currentStep === 1) {
      router.back()
      return
    }
    if (!canGoBack) return
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setResult("")
    if (currentStep === 4) {
      setRegisteredPassword("")
      setCurrentStep(2)
    } else {
      setCurrentStep((s) => s - 1)
    }
  }

  usePreventRemove(currentStep > 1 && currentStep < 6, handleBack)

  useEffect(() => {
    if (currentStep === 6) {
      const t = setTimeout(() => {
        storage.set("onboarding.skipDisplayName", true)
        router.replace({ pathname: "/(logged-in)/onboarding", params: {} })
      }, SUCCESS_DELAY_MS)
      return () => clearTimeout(t)
    }
  }, [currentStep])

  const navigation = useNavigation()

  const headerTitle =
    currentStep === 1
      ? "registerScreen:languageStepTitle"
      : currentStep === 2
        ? "registerScreen:emailStepTitle"
        : currentStep === 3
          ? "registerScreen:passwordStepTitle"
          : currentStep === 5
            ? "registerScreen:displayNameStepTitle"
            : "registerScreen:title"

  useEffect(() => {
    if (currentStep === 6) {
      navigation.setOptions({ headerShown: false })
    } else {
      navigation.setOptions({ headerShown: true })
    }
  }, [currentStep, navigation])

  useHeader(
    {
      titleTx: headerTitle,
      leftIcon: canGoBack ? "back" : undefined,
      onLeftPress: canGoBack ? handleBack : undefined,
    },
    [currentStep, headerTitle, canGoBack],
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
    [isPasswordHidden, colors.text],
  )

  if (currentStep === 6) {
    return (
      <CircularProgressScreen
        durationMs={SUCCESS_DELAY_MS}
        accessibilityLabel={translate("registerScreen:gettingReady")}
      />
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
            <Text tx="registerScreen:languageStepDescription" preset="formHelper" style={$hint} />
            <LanguagePicker selectedCode={selectedLanguage} onSelect={handleLanguageSelect} />
          </FormCard>
          <View style={$content}>
            <Button
              testID="register-language-button"
              tx="common:next"
              style={$tapButton}
              preset="reversed"
              onPress={handleLanguageStepSubmit}
            />
            <Text
              tx="registerScreen:alreadyHaveAccount"
              style={$register}
              onPress={() => router.push("/login-options")}
            />
          </View>
        </>
      )}

      {currentStep === 2 && (
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
              onPress={() => router.push("/login-options")}
            />
          </View>
        </>
      )}

      {currentStep === 3 && (
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
            {result ? (
              <Text tx={result as TxKeyPath} preset="formHelper" style={themed($errorText)} />
            ) : null}
          </FormCard>
          <View style={$content}>
            <Button
              testID="register-button"
              tx="common:next"
              style={$tapButton}
              preset="reversed"
              onPress={handlePasswordStepSubmit}
              loading={isInFlight}
            />
            <Text
              tx="registerScreen:alreadyHaveAccount"
              style={$register}
              onPress={() => router.push("/login-options")}
            />
          </View>
        </>
      )}

      {currentStep === 4 && (
        <>
          <FormCard>
            <Text tx="emailVerificationScreen:sentToPrefix" preset="formHelper" />
            <Text weight="bold">{authEmail}</Text>
            <Divider />
            <Text tx="emailVerificationScreen:sentToSuffix" preset="formHelper" />
            <Text tx="emailVerificationScreen:returnHereHint" preset="formHelper" style={$hint} />
            {result ? (
              <Text
                tx={result as TxKeyPath}
                preset="formHelper"
                style={result === RESEND_SUCCESS_TX ? $hint : themed($errorText)}
              />
            ) : null}
            {isInFlight && (
              <React.Fragment>
                <Divider style={{ marginVertical: spacing.xs }} />
                <View style={$verifyingRow}>
                  <ActivityIndicator color={colors.tint} size="small" />
                  <Text tx="emailVerificationScreen:verifying" preset="formHelper" />
                </View>
              </React.Fragment>
            )}
          </FormCard>
          <View style={$content}>
            <Button
              tx="emailVerificationScreen:iveVerified"
              preset="reversed"
              onPress={handleVerify}
              loading={isInFlight}
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
              loading={isResending}
              style={$resendButton}
            />
          </View>
        </>
      )}

      {currentStep === 5 && (
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
              onSubmitEditing={handleDisplayNameContinue}
            />
            {result ? (
              <Text tx={result as TxKeyPath} preset="formHelper" style={themed($errorText)} />
            ) : null}
          </FormCard>
          <View style={$content}>
            <Button
              tx="common:next"
              preset="reversed"
              onPress={handleDisplayNameContinue}
              loading={isInFlight}
              style={$tapButton}
            />
          </View>
        </>
      )}
    </Screen>
  )
}

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

const $verifyingRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
}

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  marginTop: theme.spacing.xs,
})
