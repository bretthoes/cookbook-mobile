import React, { useState, useEffect } from "react"
import { ViewStyle } from "react-native"
import { Screen, ListItem, Text, UseCase } from "src/components"
import { spacing } from "src/theme"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from "i18next"
import { useHeader } from "src/utils/useHeader"

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "ko", name: "한국어" },
]

export default function LanguageScreen() {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language)

  useHeader({
    leftIcon: "back",
    title: "Select Language",
    onLeftPress: () => router.back(),
  })

  useEffect(() => {
    const fetchLanguage = async () => {
      const value = await AsyncStorage.getItem("language")
      if (value !== null) {
        setCurrentLanguage(value)
      }
    }
    fetchLanguage()
  }, [])

  const handleLanguageSelect = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode)
    await AsyncStorage.setItem("language", languageCode)
    setCurrentLanguage(languageCode)
  }

  return (
    <Screen preset="scroll" style={$root}>
      <Text
        tx="languageScreen:support"
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />
      <Text
        tx="languageScreen:note"
        preset="formLabel"
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />
      <UseCase name="Languages">
        {languages.map((language) => (
          <ListItem
            key={language.code}
            text={language.name}
            bottomSeparator
            topSeparator
            onPress={() => handleLanguageSelect(language.code)}
            rightIcon={currentLanguage === language.code ? "check" : undefined}
          />
        ))}
      </UseCase>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
