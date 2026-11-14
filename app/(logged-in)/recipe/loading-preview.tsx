import { CircularProgress } from "@/components/CircularProgress"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { useHeader } from "@/utils/useHeader"
import { Redirect, router, useLocalSearchParams } from "expo-router"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, ViewStyle } from "react-native"

export default function LoadingPreviewScreen() {
  const { t } = useTranslation()
  const { variant } = useLocalSearchParams<{ variant?: "signIn" }>()
  const [replayKey, setReplayKey] = useState(0)

  useHeader({
    leftIcon: "back",
    onLeftPress: () => router.back(),
  })

  if (!__DEV__) return <Redirect href="/(logged-in)/recipe/add-options" />

  if (variant === "signIn") {
    return (
      <Screen preset="fixed" contentContainerStyle={$signingInContainer}>
        <Pressable onPress={() => setReplayKey((k) => k + 1)}>
          <CircularProgress key={replayKey} accessibilityLabel={t("common:signingIn")} />
        </Pressable>
      </Screen>
    )
  }

  return <LoadingScreen />
}

const $signingInContainer: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}
