import "@/instrumentation"
import { registerNavigationContainer, Sentry } from "@/utils/crashReporting"
import { Slot, SplashScreen, useNavigationContainerRef } from "expo-router"
import { useEffect, useState } from "react"
import { ViewStyle } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
// @mst replace-next-line
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary"
import Config from "@/config"
import { initI18n } from "@/i18n"
import { useInitialRootStore } from "@/models/helpers/useStores"
import { customFontsToLoad } from "@/theme"
import { ThemeProvider } from "@/theme/context"
import { loadDateFnsLocale } from "@/utils/formatDate"
import { useFonts } from "expo-font"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { KeyboardProvider } from "react-native-keyboard-controller"

SplashScreen.preventAutoHideAsync()

function Root() {
  const navigationContainerRef = useNavigationContainerRef()
  // @mst remove-block-start
  // Wait for stores to load and render our layout inside of it so we have access
  // to auth info etc
  const { rehydrated } = useInitialRootStore()
  // @mst remove-block-end

  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    registerNavigationContainer(navigationContainerRef)
  }, [navigationContainerRef])

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
    <ErrorBoundary catchErrors={Config.catchErrors}>
      <GestureHandlerRootView style={$root}>
        <ThemeProvider>
          <ActionSheetProvider>
            <KeyboardProvider>
              <Slot />
            </KeyboardProvider>
          </ActionSheetProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}

export default Sentry.wrap(Root)

const $root: ViewStyle = { flex: 1 }
