import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useFacebookSignIn } from "@/hooks/useFacebookSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"
import { useStores } from "@/models/helpers/useStores"
import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Platform, TextStyle, View, ViewStyle } from "react-native"

const appleLogo = require("@/assets/images/apple.png")
const facebookLogo = require("@/assets/images/facebook.png")
const googleLogo = require("@/assets/images/google.png")

export default observer(function LoginOptionsScreen() {
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
    titleTx: "loginOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

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
            onPress={async () => {
              if (isAppleLoading) return
              setIsAppleLoading(true)
              const credential = await appleSignIn()
              if (credential) {
                const success = await authenticationStore.loginWithApple(credential.identityToken)
                if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
              }
              setIsAppleLoading(false)
            }}
          />
        )}
        <OptionListItem
          title={t("loginOptionsScreen:optionGoogle")}
          description={t("loginOptionsScreen:optionGoogleDesc")}
          leftImage={googleLogo}
          onPress={async () => {
            if (isGoogleLoading) return
            setIsGoogleLoading(true)
            const credential = await googleSignIn()
            if (credential) {
              const success = await authenticationStore.loginWithGoogle(credential.idToken)
              if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
            }
            setIsGoogleLoading(false)
          }}
        />
        <OptionListItem
          title={t("loginOptionsScreen:optionFacebook")}
          description={t("loginOptionsScreen:optionFacebookDesc")}
          leftImage={facebookLogo}
          onPress={async () => {
            if (isFacebookLoading) return
            setIsFacebookLoading(true)
            const credential = await facebookSignIn()
            if (credential) {
              const success = await authenticationStore.loginWithFacebook(credential.accessToken)
              if (success) router.replace("/(logged-in)/(tabs)/cookbooks")
            }
            setIsFacebookLoading(false)
          }}
        />
      </View>
      {result ? <Text text={result} preset="formHelper" style={$errorText} /> : null}
      <View style={$footer}>
        <Text
          tx="loginOptionsScreen:register"
          style={$registerLink}
          onPress={() => router.replace("/register-options")}
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

const $registerLink: TextStyle = {
  textDecorationLine: "underline",
}

const $errorText: TextStyle = {
  color: colors.error,
  marginTop: spacing.sm,
  paddingHorizontal: spacing.md,
}
