import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

import { ThemedStyle, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"

import { Screen } from "./Screen"
import { Text } from "./Text"

const loadingImage = require("../assets/images/loading.png")

export interface LoadingScreenProps {
  /**
   * The text to display above the animated dots
   * @default translate("common:loading")
   */
  text?: string
  /**
   * When provided, shows an estimated progress bar that fills to ~90% over
   * this duration, then holds until the screen unmounts. Useful for long
   * operations where real progress is unavailable.
   */
  estimatedDurationMs?: number
}

/**
 * A full-screen loading indicator with an image and animated typing dots.
 */
export function LoadingScreen(props: LoadingScreenProps) {
  const { t } = useTranslation()
  const { themed } = useAppTheme()
  const text = props.text ?? t("common:loading")

  const dot1Y = useSharedValue(0)
  const dot2Y = useSharedValue(0)
  const dot3Y = useSharedValue(0)
  const progressWidth = useSharedValue(0)

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }))

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }))

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }))

  const $progressFillAnimated = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }))

  useEffect(() => {
    const bounce = withRepeat(
      withSequence(withTiming(-6, { duration: 200 }), withTiming(0, { duration: 200 })),
      -1,
      false,
    )
    dot1Y.value = bounce
    dot2Y.value = withDelay(150, bounce)
    dot3Y.value = withDelay(300, bounce)
  }, [dot1Y, dot2Y, dot3Y])

  useEffect(() => {
    if (!props.estimatedDurationMs) return

    progressWidth.value = withTiming(90, {
      duration: props.estimatedDurationMs,
      easing: Easing.out(Easing.cubic),
    })
  }, [props.estimatedDurationMs, progressWidth])

  const $themedProgressTrack = useMemo(() => themed($progressTrack), [themed])
  const $themedProgressFill = useMemo(() => themed($progressFill), [themed])

  return (
    <Screen style={$root} preset="fixed" contentContainerStyle={$container}>
      <Image source={loadingImage} style={$image} resizeMode="contain" />
      <View style={$textRow}>
        <Text preset="subheading" text={text} />
        <Animated.Text style={[dot1Style, $dot]}>.</Animated.Text>
        <Animated.Text style={[dot2Style, $dot]}>.</Animated.Text>
        <Animated.Text style={[dot3Style, $dot]}>.</Animated.Text>
      </View>
      {props.estimatedDurationMs != null && (
        <View style={$themedProgressTrack}>
          <Animated.View style={[$themedProgressFill, $progressFillAnimated]} />
        </View>
      )}
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $container: ViewStyle = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
}

const $image: ImageStyle = {
  width: 250,
  height: 250,
  marginBottom: spacing.lg,
}

const $textRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $dot: TextStyle = {
  fontSize: 24,
  fontWeight: "bold",
  marginLeft: 2,
}

const $progressTrack: ThemedStyle<ViewStyle> = (theme) => ({
  width: "70%",
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.colors.tintInactive,
  marginTop: spacing.lg,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = (theme) => ({
  height: "100%",
  borderRadius: 3,
  backgroundColor: theme.colors.tint,
})
