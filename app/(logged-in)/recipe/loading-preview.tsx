import { LoadingScreen } from "@/components/LoadingScreen"
import { useHeader } from "@/utils/useHeader"
import { Redirect, router } from "expo-router"

export default function LoadingPreviewScreen() {
  useHeader({
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  if (!__DEV__) return <Redirect href="/(logged-in)/recipe/add-options" />

  return <LoadingScreen />
}
