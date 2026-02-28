import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { TextStyle, View, ViewStyle } from "react-native"

const appleLogo = require("@/assets/images/apple.png")
const googleLogo = require("@/assets/images/google.png")

export default observer(function RegisterOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()

  useHeader({
    leftIcon: "back",
    titleTx: "registerOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <OptionListItem
          title={t("registerOptionsScreen:optionEmail")}
          description={t("registerOptionsScreen:optionEmailDesc")}
          leftIcon="mail"
          onPress={() => router.replace("/register")}
        />
        <OptionListItem
          title={t("registerOptionsScreen:optionApple")}
          description={t("registerOptionsScreen:optionAppleDesc")}
          leftImage={appleLogo}
          onPress={() => {
            // TODO: Sign in with Apple
          }}
        />
        <OptionListItem
          title={t("registerOptionsScreen:optionGoogle")}
          description={t("registerOptionsScreen:optionGoogleDesc")}
          leftImage={googleLogo}
          onPress={() => {
            // TODO: Sign in with Google
          }}
        />
      </View>
      <View style={$footer}>
        <Text
          tx="registerScreen:alreadyHaveAccount"
          style={$loginLink}
          onPress={() => router.replace("/log-in")}
        />
      </View>
    </Screen>
  )
})

const $footer: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xl,
  alignItems: "center",
}

const $loginLink: TextStyle = {
  textDecorationLine: "underline",
}
