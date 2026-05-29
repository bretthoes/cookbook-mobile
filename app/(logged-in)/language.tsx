import { LanguagePicker } from "@/components/LanguagePicker"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { getActiveLanguageCode, getStoredLanguageCode, setAppLanguage } from "@/i18n/language"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ViewStyle } from "react-native"
import type { SupportedLanguageCode } from "@/i18n/language"

export default function LanguageScreen() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguageCode>(getActiveLanguageCode())

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
      <Text
        tx="languageScreen:support"
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />
      <LanguagePicker selectedCode={currentLanguage} onSelect={handleLanguageSelect} />
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
