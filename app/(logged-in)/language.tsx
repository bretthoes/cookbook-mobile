import { LanguagePicker } from "@/components/LanguagePicker"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import Config from "@/config"
import { getActiveLanguageCode, getStoredLanguageCode, setAppLanguage } from "@/i18n/language"
import { colors, spacing } from "@/theme"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import type { SupportedLanguageCode } from "@/i18n/language"

const openLanguageSupportEmail = () =>
  openLinkInBrowser(`mailto:${Config.SUPPORT_EMAIL}?subject=Language%20Support%20Request`)

export default function LanguageScreen() {
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguageCode>(getActiveLanguageCode())

  useHeader({
    leftIcon: "back",
    titleTx: "languageScreen:title",
    onLeftPress: () => router.back(),
  })

  useEffect(() => {
    getStoredLanguageCode().then((stored) => {
      if (stored) setCurrentLanguage(stored)
    })
  }, [])

  const handleLanguageSelect = useCallback(async (languageCode: SupportedLanguageCode) => {
    await setAppLanguage(languageCode)
    setCurrentLanguage(languageCode)
  }, [])

  return (
    <Screen preset="scroll" style={$root}>
      <View style={$supportSection}>
        <Text tx="languageScreen:support" style={$supportText} />
        <Text
          style={$requestLink}
          tx="profileScreen:reportBugs"
          onPress={openLanguageSupportEmail}
        />
      </View>
      <LanguagePicker selectedCode={currentLanguage} onSelect={handleLanguageSelect} />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $supportSection: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
}

const $supportText: TextStyle = {
  marginBottom: spacing.sm,
}

const $requestLink: TextStyle = {
  color: colors.tint,
}
