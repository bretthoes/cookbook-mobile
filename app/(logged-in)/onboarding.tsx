import { Button } from "@/components/Button"
import { FormCard } from "@/components/FormCard"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { StepIndicator } from "@/components/StepIndicator"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { Switch } from "@/components/Toggle"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { remove, storage } from "@/utils/storage"
import { useHeader } from "@/utils/useHeader"
import { router, useNavigation } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { LayoutAnimation, TextInput, TextStyle, View, ViewStyle } from "react-native"

const isValidDisplayName = (input: string) => /^[\p{L}\p{M} \-']+$/u.test(input)

// Display name step is always step 1; only shown for SSO users.
// Email users set onboarding.skipDisplayName=true in register.tsx before navigating here.
const STEP_DISPLAY_NAME = 1

export default observer(function OnboardingScreen() {
  // Read and immediately consume the flag — runs once at mount, never stale.
  // skipDisplayName=true  → email user, skip step 1 → steps: darkMode=1, largeFont=2, done=3
  // skipDisplayName=false → SSO user,   show step 1 → steps: displayName=1, darkMode=2, largeFont=3, done=4
  const [skipDisplayName] = useState(() => {
    const skip = storage.getBoolean("onboarding.skipDisplayName") === true
    remove("onboarding.skipDisplayName")
    return skip
  })

  const totalSteps = skipDisplayName ? 3 : 4
  const STEP_DARK_MODE = skipDisplayName ? 1 : 2
  const STEP_LARGE_FONT = skipDisplayName ? 2 : 3
  const STEP_DONE = skipDisplayName ? 3 : 4

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const displayNameInputRef = useRef<TextInput>(null)

  const { themed, themeContext, setThemeContextOverride, largeFontEnabled, setLargeFontEnabled } =
    useAppTheme()

  const {
    authenticationStore: { setDisplayName, updateDisplayName },
  } = useStores()

  const [localDisplayName, setLocalDisplayName] = useState("")

  const navigation = useNavigation()

  const advanceStep = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setCurrentStep((s) => Math.min(s + 1, totalSteps))
  }, [totalSteps])

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      router.back()
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setCurrentStep((s) => Math.max(s - 1, 1))
    }
  }, [currentStep])

  // Display name validation
  const displayNameError = useMemo(() => {
    if (localDisplayName.length === 0)
      return translate("setDisplayNameScreen:validation.cantBeBlank")
    if (localDisplayName.length > 60) return translate("setDisplayNameScreen:validation.tooLong60")
    if (!isValidDisplayName(localDisplayName))
      return translate("setDisplayNameScreen:validation.invalidChars")
    return ""
  }, [localDisplayName])

  const displayNameValidationError = isSubmitted ? displayNameError : ""

  const handleDisplayNameContinue = async () => {
    setIsSubmitted(true)
    if (displayNameError) return
    setDisplayName(localDisplayName.trim())
    const success = await updateDisplayName()
    if (success) {
      setIsSubmitted(false)
      advanceStep()
    }
  }

  // Header title per step
  const headerTitle = useMemo(() => {
    if (!skipDisplayName && currentStep === STEP_DISPLAY_NAME)
      return "onboardingScreen:displayNameTitle"
    if (currentStep === STEP_DARK_MODE) return "onboardingScreen:darkModeTitle"
    if (currentStep === STEP_LARGE_FONT) return "onboardingScreen:largeFontTitle"
    return "onboardingScreen:doneTitle"
  }, [currentStep, skipDisplayName, STEP_DARK_MODE, STEP_LARGE_FONT])

  // Hide header on done step
  useEffect(() => {
    if (currentStep === STEP_DONE) {
      navigation.setOptions({ headerShown: false })
    } else {
      navigation.setOptions({ headerShown: true })
    }
  }, [currentStep, STEP_DONE, navigation])

  // Navigate to cookbooks after done step delay
  useEffect(() => {
    if (currentStep === STEP_DONE) {
      const t = setTimeout(() => {
        storage.set("hasCompletedOnboarding", true)
        router.replace("/(logged-in)/(tabs)/cookbooks")
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [currentStep, STEP_DONE])

  useHeader(
    {
      titleTx: headerTitle as any,
      leftIcon: "back",
      onLeftPress: handleBack,
      ...(!skipDisplayName && currentStep === STEP_DISPLAY_NAME && {
        rightTx: "setDisplayNameScreen:continue" as any,
        onRightPress: handleDisplayNameContinue,
      }),
    },
    [currentStep, localDisplayName],
  )

  const $themedToggleRow = useMemo(() => themed($toggleRow), [themed])

  // Done step — full-screen loading screen
  if (currentStep === STEP_DONE) {
    return <LoadingScreen text={translate("onboardingScreen:gettingReady")} />
  }

  return (
    <Screen preset="scroll" style={$root} safeAreaEdges={["top", "bottom"]}>
      <View style={$content}>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </View>

      {!skipDisplayName && currentStep === STEP_DISPLAY_NAME && (
        <>
          <FormCard>
            <Text
              tx="onboardingScreen:displayNameDescription"
              preset="formHelper"
              style={$description}
            />
            <TextField
              ref={displayNameInputRef}
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
          </FormCard>
          <View style={$content}>
            <Button
              tx="setDisplayNameScreen:continue"
              preset="reversed"
              onPress={handleDisplayNameContinue}
              style={$actionButton}
            />
          </View>
        </>
      )}

      {currentStep === STEP_DARK_MODE && (
        <>
          <FormCard>
            <Text tx="onboardingScreen:darkModeTitle" preset="subheading" style={$cardHeading} />
            <Text
              tx="onboardingScreen:darkModeDescription"
              preset="formHelper"
              style={$description}
            />
            <View style={$themedToggleRow}>
              <Switch
                value={themeContext === "dark"}
                onValueChange={(val) => setThemeContextOverride(val ? "dark" : "light")}
              />
            </View>
          </FormCard>
          <View style={$content}>
            <Button tx="common:next" preset="reversed" onPress={advanceStep} style={$actionButton} />
          </View>
        </>
      )}

      {currentStep === STEP_LARGE_FONT && (
        <>
          <FormCard>
            <Text tx="onboardingScreen:largeFontTitle" preset="subheading" style={$cardHeading} />
            <Text
              tx="onboardingScreen:largeFontDescription"
              preset="formHelper"
              style={$description}
            />
            <View style={$themedToggleRow}>
              <Switch value={largeFontEnabled} onValueChange={setLargeFontEnabled} />
            </View>
          </FormCard>
          <View style={$content}>
            <Button tx="common:next" preset="reversed" onPress={advanceStep} style={$actionButton} />
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

const $cardHeading: TextStyle = {
  marginBottom: spacing.xs,
}

const $description: TextStyle = {
  marginBottom: spacing.md,
}

const $toggleRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: theme.spacing.lg,
})

const $actionButton: ViewStyle = {
  marginBottom: spacing.sm,
}
