import { Image } from "expo-image"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { ImageStyle, TextStyle, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

import type { TxKeyPath } from "@/i18n"
import { spacing } from "@/theme"

import { Screen } from "./Screen"
import { Text } from "./Text"

const loadingImage = require("../assets/images/loading.webp")

const MESSAGE_DURATION_MS = 5_000
const MESSAGE_FADE_MS = 250
const DOT_INTERVAL_MS = 450
const MAX_DOTS = 3

const FIRST_COOKING_MESSAGE: TxKeyPath = "loadingScreen:stillCooking"
const OTHER_COOKING_MESSAGES: TxKeyPath[] = [
  "loadingScreen:preheatingTheOven",
  "loadingScreen:gatheringIngredients",
  "loadingScreen:stirringThePot",
  "loadingScreen:lettingItSimmer",
  "loadingScreen:addingAPinchOfSalt",
  "loadingScreen:tasteTesting",
]
const RANDOM_MESSAGE_COUNT = 2

function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export interface LoadingScreenProps {
  /**
   * Fixed text to display before the animated dots. When omitted, a few
   * cooking-themed messages rotate every few seconds. Either way, the text
   * switches to a "taking a while" message once those messages have run out.
   */
  text?: string
}

/**
 * A full-screen loading indicator with an animated image and typing dots.
 */
export function LoadingScreen(props: LoadingScreenProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [cookingMessages] = useState(() => [
    FIRST_COOKING_MESSAGE,
    ...shuffled(OTHER_COOKING_MESSAGES).slice(0, RANDOM_MESSAGE_COUNT),
  ])
  const [step, setStep] = useState(0)
  const [dotCount, setDotCount] = useState(1)

  const isTakingAWhile = step >= cookingMessages.length
  const targetText = isTakingAWhile
    ? t("loadingScreen:takingAWhile")
    : (props.text ?? t(cookingMessages[step]))
  const [displayedText, setDisplayedText] = useState(targetText)

  const textOpacity = useSharedValue(1)
  const $textRowAnimated = useAnimatedStyle(() => ({ opacity: textOpacity.value }))

  useEffect(() => {
    if (isTakingAWhile) return
    const timer = setTimeout(() => setStep((s) => s + 1), MESSAGE_DURATION_MS)
    return () => clearTimeout(timer)
  }, [step, isTakingAWhile])

  useEffect(() => {
    if (targetText === displayedText) return
    if (reduceMotion) {
      setDisplayedText(targetText)
      return
    }
    textOpacity.value = withTiming(0, { duration: MESSAGE_FADE_MS })
    const timer = setTimeout(() => {
      setDisplayedText(targetText)
      textOpacity.value = withTiming(1, { duration: MESSAGE_FADE_MS })
    }, MESSAGE_FADE_MS)
    return () => clearTimeout(timer)
  }, [targetText, displayedText, reduceMotion, textOpacity])

  useEffect(() => {
    const timer = setInterval(() => setDotCount((c) => (c % MAX_DOTS) + 1), DOT_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <Screen style={$root} preset="fixed" contentContainerStyle={$container}>
      <Image source={loadingImage} style={$image} contentFit="contain" autoplay={!reduceMotion} />
      <Animated.View style={[$textRow, $textRowAnimated]}>
        <Text preset="subheading" text={displayedText} />
        {Array.from({ length: MAX_DOTS }, (_, i) => (
          <Text
            key={i}
            preset="subheading"
            text="."
            style={i < dotCount ? undefined : $hiddenDot}
          />
        ))}
      </Animated.View>
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

const $hiddenDot: TextStyle = {
  opacity: 0,
}
