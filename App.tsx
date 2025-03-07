import "@expo/metro-runtime"
import React from "react"
import * as SplashScreen from "expo-splash-screen"
import App from "./app/app"
import { ActionSheetProvider } from "@expo/react-native-action-sheet"

SplashScreen.preventAutoHideAsync()

function IgniteApp() {
  return (
    <ActionSheetProvider>
      <App hideSplashScreen={SplashScreen.hideAsync} />
    </ActionSheetProvider>
  )
}

export default IgniteApp
