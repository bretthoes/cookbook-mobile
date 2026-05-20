import { LoadingScreen } from "@/components/LoadingScreen"
import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useSsoAuth } from "@/hooks/useSsoAuth"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { storage } from "@/utils/storage"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
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

export default observer(function RegisterOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const { authenticationStore } = useStores()
  const { result } = authenticationStore
  const onAuthSuccess = useCallback(() => navigateAfterAuth(), [])
  const { isSsoLoading, signInWithApple, signInWithGoogle, signInWithFacebook } =
    useSsoAuth(onAuthSuccess)

  useHeader({
    leftIcon: "back",
    titleTx: "registerOptionsScreen:title",
    onLeftPress: () => router.back(),
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
        <Text tx="registerOptionsScreen:title" preset="heading" />
        <Text tx="registerOptionsScreen:subtitle" preset="subheading" style={$subtitle} />
      </View>
      <View style={$themedListContainer}>
        <OptionListItem
          title={t("registerOptionsScreen:optionEmail")}
          description={t("registerOptionsScreen:optionEmailDesc")}
          leftIcon="mail"
          onPress={() => router.replace("/register")}
        />
        {Platform.OS === "ios" && (
          <OptionListItem
            title={t("registerOptionsScreen:optionApple")}
            description={t("registerOptionsScreen:optionAppleDesc")}
            leftImage={appleLogo}
            onPress={signInWithApple}
          />
        )}
        <OptionListItem
          title={t("registerOptionsScreen:optionGoogle")}
          description={t("registerOptionsScreen:optionGoogleDesc")}
          leftImage={googleLogo}
          onPress={signInWithGoogle}
        />
        <OptionListItem
          title={t("registerOptionsScreen:optionFacebook")}
          description={t("registerOptionsScreen:optionFacebookDesc")}
          leftImage={facebookLogo}
          onPress={signInWithFacebook}
        />
      </View>
      {result ? <Text text={result} preset="formHelper" style={$themedErrorText} /> : null}
      <View style={$footer}>
        <Text
          tx="registerScreen:alreadyHaveAccount"
          style={$loginLink}
          onPress={() => router.replace("/login-options")}
        />
      </View>
    </Screen>
  )
})

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

const $loginLink: TextStyle = {
  textDecorationLine: "underline",
}

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  marginTop: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
})
