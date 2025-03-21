import { useEffect, useState } from "react"
import { ViewStyle } from "react-native"
import { Slot, SplashScreen } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
// @mst replace-next-line
import { useInitialRootStore } from "src/models/helpers/useStores"
import { useFonts } from "@expo-google-fonts/space-grotesk"
import { customFontsToLoad } from "src/theme"
import { initI18n } from "src/i18n"
import { loadDateFnsLocale } from "src/utils/formatDate"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { useThemeProvider } from "src/utils/useAppTheme"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"

SplashScreen.preventAutoHideAsync()

if (__DEV__) {
  // Load Reactotron configuration in development. We don't want to
  // include this in our production bundle, so we are using `if (__DEV__)`
  // to only execute this in development.
  require("src/devtools/ReactotronConfig.ts")
}

export { ErrorBoundary } from "src/components/ErrorBoundary/ErrorBoundary"

export default function Root() {
  // @mst remove-block-start
  // Wait for stores to load and render our layout inside of it so we have access
  // to auth info etc
  const { rehydrated } = useInitialRootStore()
  // @mst remove-block-end

  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)
  const { ThemeProvider, themeScheme, setThemeContextOverride } = useThemeProvider()

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const loaded = fontsLoaded && isI18nInitialized && rehydrated // @mst remove-current-line

  useEffect(() => {
    if (fontError) throw fontError
  }, [fontError])

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={$root}>
      <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
        <ActionSheetProvider>
          <KeyboardProvider>
            <Slot />
          </KeyboardProvider>
        </ActionSheetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

const $root: ViewStyle = { flex: 1 }
