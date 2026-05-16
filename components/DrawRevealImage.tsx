import { useEffect } from "react"
import { Image, type ImageProps, type ImageStyle } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"

export interface DrawRevealImageProps {
  source: ImageProps["source"]
  width: number
  height: number
  /** Duration of the left-to-right reveal in ms */
  duration?: number
  /** Delay before the reveal starts in ms */
  delay?: number
  resizeMode?: ImageProps["resizeMode"]
}

/**
 * Reveals a raster image left-to-right (like a wipe / draw-on effect).
 * For true stroke animation, use an SVG with path dashoffset instead.
 */
export function DrawRevealImage({
  source,
  width,
  height,
  duration = 1400,
  delay = 200,
  resizeMode = "contain",
}: DrawRevealImageProps) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = 0
    const timeout = setTimeout(() => {
      progress.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    }, delay)
    return () => clearTimeout(timeout)
  }, [delay, duration, progress])

  const $clip = useAnimatedStyle(() => ({
    width: progress.value * width,
  }))

  const imageStyle: ImageStyle = { width, height }

  return (
    <Animated.View style={[$clipContainer, { height }, $clip]}>
      <Image source={source} style={imageStyle} resizeMode={resizeMode} />
    </Animated.View>
  )
}

const $clipContainer = {
  overflow: "hidden" as const,
}
