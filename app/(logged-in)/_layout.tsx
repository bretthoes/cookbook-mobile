import { useStores } from "@/models/helpers/useStores"
import { customFontsToLoad } from "@/theme"
import { useFonts } from "expo-font"
import { Redirect, SplashScreen, Stack } from "expo-router"
import { observer } from "mobx-react-lite"
import React from "react"

export default observer(function Layout() {
  const {
    authenticationStore: { isAuthenticated },
  } = useStores()

  const [fontsLoaded, fontError] = useFonts(customFontsToLoad)

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  if (!isAuthenticated) {
    return <Redirect href="/log-in" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
})
