import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useFacebookSignIn } from "@/hooks/useFacebookSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"
import { useStores } from "@/models/helpers/useStores"
import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { storage } from "@/utils/storage"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Platform, TextStyle, View, ViewStyle } from "react-native"

function navigateAfterAuth() {
  if (storage.getBoolean("hasCompletedOnboarding")) {
    router.replace("/(logged-in)/(tabs)/cookbooks")
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace({ pathname: "/(logged-in)/onboarding" as any })
  }
}

const appleLogo = require("@/assets/images/apple.png")
const facebookLogo = require("@/assets/images/facebook.png")
const googleLogo = require("@/assets/images/google.png")

export default observer(function RegisterOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const { signIn: googleSignIn } = useGoogleSignIn()
  const { signIn: appleSignIn } = useAppleSignIn()
  const { signIn: facebookSignIn } = useFacebookSignIn()
  const { authenticationStore } = useStores()
  const { result } = authenticationStore
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isAppleLoading, setIsAppleLoading] = useState(false)
  const [isFacebookLoading, setIsFacebookLoading] = useState(false)

  useHeader({
    leftIcon: "back",
    titleTx: "registerOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

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
            onPress={async () => {
              if (isAppleLoading) return
              setIsAppleLoading(true)
              const credential = await appleSignIn()
              if (credential) {
                const success = await authenticationStore.loginWithApple(credential.identityToken)
                if (success) navigateAfterAuth()
              }
              setIsAppleLoading(false)
            }}
          />
        )}
        <OptionListItem
          title={t("registerOptionsScreen:optionGoogle")}
          description={t("registerOptionsScreen:optionGoogleDesc")}
          leftImage={googleLogo}
          onPress={async () => {
            if (isGoogleLoading) return
            setIsGoogleLoading(true)
            const credential = await googleSignIn()
            if (credential) {
              const success = await authenticationStore.loginWithGoogle(credential.idToken)
              if (success) navigateAfterAuth()
            }
            setIsGoogleLoading(false)
          }}
        />
        <OptionListItem
          title={t("registerOptionsScreen:optionFacebook")}
          description={t("registerOptionsScreen:optionFacebookDesc")}
          leftImage={facebookLogo}
          onPress={async () => {
            if (isFacebookLoading) return
            setIsFacebookLoading(true)
            const credential = await facebookSignIn()
            if (credential) {
              const success = await authenticationStore.loginWithFacebook(credential.accessToken)
              if (success) navigateAfterAuth()
            }
            setIsFacebookLoading(false)
          }}
        />
      </View>
      {result ? <Text text={result} preset="formHelper" style={$errorText} /> : null}
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

const $errorText: TextStyle = {
  color: colors.error,
  marginTop: spacing.sm,
  paddingHorizontal: spacing.md,
}
