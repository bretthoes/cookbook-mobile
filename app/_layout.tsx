import "@/instrumentation"
import { registerNavigationContainer, Sentry } from "@/utils/crashReporting"
import { Slot, SplashScreen, useNavigationContainerRef } from "expo-router"
import { useEffect, useState } from "react"
import { ViewStyle } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary"
import Config from "@/config"
import { initI18n } from "@/i18n"
import { useAppInit } from "@/hooks/useAppInit"
import { customFontsToLoad } from "@/theme"
import { ThemeProvider } from "@/theme/context"
import { loadDateFnsLocale } from "@/utils/formatDate"
import { useFonts } from "expo-font"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"
import { QueryProvider } from "@/services/query/QueryProvider"
import { KeyboardProvider } from "react-native-keyboard-controller"

SplashScreen.preventAutoHideAsync()

function Root() {
  const navigationContainerRef = useNavigationContainerRef()
  const { ready: rehydrated } = useAppInit()

  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)
  const [isI18nInitialized, setIsI18nInitialized] = useState(false)

  useEffect(() => {
    registerNavigationContainer(
      navigationContainerRef as Parameters<typeof registerNavigationContainer>[0],
    )
  }, [navigationContainerRef])

  useEffect(() => {
    initI18n()
      .then(() => setIsI18nInitialized(true))
      .then(() => loadDateFnsLocale())
  }, [])

  const loaded = fontsLoaded && isI18nInitialized && rehydrated

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
          <QueryProvider>
            <ActionSheetProvider>
              <KeyboardProvider>
                <Slot />
              </KeyboardProvider>
            </ActionSheetProvider>
          </QueryProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}

export default Sentry.wrap(Root)

const $root: ViewStyle = { flex: 1 }
