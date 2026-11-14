import { ViewStyle } from "react-native"

import { CircularProgress, type CircularProgressProps } from "./CircularProgress"
import { Screen } from "./Screen"

export type CircularProgressScreenProps = Pick<
  CircularProgressProps,
  "durationMs" | "accessibilityLabel"
>

/**
 * A full screen with a centered CircularProgress ring, for short waits where
 * the full LoadingScreen would feel heavier than the wait itself.
 */
export function CircularProgressScreen(props: CircularProgressScreenProps) {
  return (
    <Screen preset="fixed" contentContainerStyle={$container}>
      <CircularProgress {...props} />
    </Screen>
  )
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}
