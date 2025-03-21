import React, { useState, useEffect } from "react"
import { ViewStyle, TextStyle } from "react-native"
import { Screen, ListItem, Text } from "src/components"
import { colors, spacing } from "src/theme"
import { useAppTheme } from "src/utils/useAppTheme"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from "i18next"

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "ko", name: "한국어" },
]

export default function LanguageScreen() {
  const { themeContext } = useAppTheme()
  const isDark = themeContext === "dark"
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  useEffect(() => {
    AsyncStorage.getItem("language").then((value) => {
      if (value !== null) {
        setCurrentLanguage(value)
      }
    })
  }, [])

  const handleLanguageSelect = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode)
    await AsyncStorage.setItem("language", languageCode)
    setCurrentLanguage(languageCode)
    router.back()
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContentContainer}>
      <Text preset="heading" text="Select Language" style={$title} />
      {languages.map((language) => (
        <ListItem
          key={language.code}
          text={language.name}
          bottomSeparator
          onPress={() => handleLanguageSelect(language.code)}
          style={isDark && $itemDark}
          rightIcon={currentLanguage === language.code ? "check" : undefined}
        />
      ))}
    </Screen>
  )
}

const $screenContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg + spacing.xl,
}

const $title: TextStyle = {
  marginBottom: spacing.lg,
}

const $itemDark: ViewStyle = {
  backgroundColor: colors.palette.neutral800,
}
