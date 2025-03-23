import React, { useState, useEffect } from "react"
import { ViewStyle } from "react-native"
import { Screen, ListItem, Text } from "src/components"
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
    <Screen preset="scroll" style={$root}>
      <Text
        text={"If you would like to request support for a language that is not listed, please make contact."}
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />
      {languages.map((language) => (
        <ListItem
          key={language.code}
          text={language.name}
          bottomSeparator
          onPress={() => handleLanguageSelect(language.code)}
          style={$item}
          rightIcon={currentLanguage === language.code ? "check" : undefined}
        />
      ))}
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $item: ViewStyle = {
  paddingHorizontal: spacing.lg,
}
