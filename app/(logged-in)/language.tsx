import { ListItem } from "@/components/ListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { UseCase } from "@/components/UseCase"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import i18n, { changeLanguage } from "i18next"
import React, { useEffect, useState } from "react"
import { ViewStyle } from "react-native"

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
    await changeLanguage(languageCode)
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
      <UseCase>
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
