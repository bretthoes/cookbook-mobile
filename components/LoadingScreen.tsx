import { translate } from "@/i18n"
import { useEffect } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

import { spacing } from "@/theme"

import { Screen } from "./Screen"
import { Text } from "./Text"

const loadingImage = require("../assets/images/loading.png")

export interface LoadingScreenProps {
  /**
   * The text to display above the animated dots
   * @default translate("common:loading")
   */
  text?: string
}

/**
 * A full-screen loading indicator with an image and animated typing dots.
 */
export function LoadingScreen({
  text = translate("common:loading"),
}: LoadingScreenProps) {
  // Animation for the typing dots
  const dot1Y = useSharedValue(0)
  const dot2Y = useSharedValue(0)
  const dot3Y = useSharedValue(0)

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }))

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }))

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }))

  useEffect(() => {
    const bounce = withRepeat(
      withSequence(withTiming(-6, { duration: 200 }), withTiming(0, { duration: 200 })),
      -1,
      false,
    )
    // Stagger each dot's animation
    dot1Y.value = bounce
    dot2Y.value = withDelay(150, bounce)
    dot3Y.value = withDelay(300, bounce)
  }, [dot1Y, dot2Y, dot3Y])

  return (
    <Screen style={$root} preset="fixed" contentContainerStyle={$container}>
      <Image source={loadingImage} style={$image} resizeMode="contain" />
      <View style={$textRow}>
        <Text preset="subheading" text={text} />
        <Animated.Text style={[dot1Style, $dot]}>.</Animated.Text>
        <Animated.Text style={[dot2Style, $dot]}>.</Animated.Text>
        <Animated.Text style={[dot3Style, $dot]}>.</Animated.Text>
      </View>
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
