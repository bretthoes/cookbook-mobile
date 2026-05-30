import { LoadingScreen } from "@/components/LoadingScreen"
import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useSsoAuth } from "@/hooks/useSsoAuth"
import { useAuthStore } from "@/stores/authStore"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { storage } from "@/utils/storage"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Platform, TextStyle, View, ViewStyle } from "react-native"

function navigateAfterAuth() {
  if (storage.getBoolean("hasCompletedOnboarding")) {
    router.replace("/(logged-in)/(tabs)/cookbooks")
  } else {
    router.replace({ pathname: "/(logged-in)/onboarding" as any })
  }
}

const appleLogo = require("@/assets/images/apple.png")
const facebookLogo = require("@/assets/images/facebook.png")
const googleLogo = require("@/assets/images/google.png")

export default function LoginOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const result = useAuthStore((s) => s.result)
  const onAuthSuccess = useCallback(() => navigateAfterAuth(), [])
  const { isSsoLoading, signInWithApple, signInWithGoogle, signInWithFacebook } =
    useSsoAuth(onAuthSuccess)

  useHeader({
    leftIcon: router.canGoBack() ? "back" : undefined,
    titleTx: "loginOptionsScreen:title",
    onLeftPress: () => (router.canGoBack() ? router.back() : router.replace("/")),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])
  const $themedErrorText = useMemo(() => themed($errorText), [themed])

  if (isSsoLoading) {
    return <LoadingScreen text={t("common:signingIn")} estimatedDurationMs={6_000} />
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$heading}>
        <Text tx="loginOptionsScreen:title" preset="heading" />
        <Text tx="loginOptionsScreen:subtitle" preset="subheading" style={$subtitle} />
      </View>
      <View style={$themedListContainer}>
        <OptionListItem
          title={t("loginOptionsScreen:optionEmail")}
          description={t("loginOptionsScreen:optionEmailDesc")}
          leftIcon="mail"
          onPress={() => router.push("/log-in")}
        />
        {Platform.OS === "ios" && (
          <OptionListItem
            title={t("loginOptionsScreen:optionApple")}
            description={t("loginOptionsScreen:optionAppleDesc")}
            leftImage={appleLogo}
            onPress={signInWithApple}
          />
        )}
        <OptionListItem
          title={t("loginOptionsScreen:optionGoogle")}
          description={t("loginOptionsScreen:optionGoogleDesc")}
          leftImage={googleLogo}
          onPress={signInWithGoogle}
        />
        <OptionListItem
          title={t("loginOptionsScreen:optionFacebook")}
          description={t("loginOptionsScreen:optionFacebookDesc")}
          leftImage={facebookLogo}
          onPress={signInWithFacebook}
        />
      </View>
      {result ? <Text text={result} preset="formHelper" style={$themedErrorText} /> : null}
      <View style={$footer}>
        <Text
          tx="loginOptionsScreen:register"
          style={$registerLink}
          onPress={() => router.replace("/register-options")}
        />
      </View>
    </Screen>
  )
}

const $heading: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.sm,
}

const $subtitle: TextStyle = {
  marginTop: spacing.xs,
}

const $footer: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xl,
  alignItems: "center",
}

const $registerLink: TextStyle = {
  textDecorationLine: "underline",
}

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
})
