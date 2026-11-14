import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useEffect, useMemo } from "react"
import { View, ViewStyle } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated"

const FAST_FILL = 0.9
const SLOW_FILL = 0.97
const SLOW_FILL_DURATION_MS = 8_000

export interface CircularProgressProps {
  /**
   * Time to fill most of the ring. After that it creeps toward full so it
   * never looks finished while the work is still running.
   * @default 2500
   */
  durationMs?: number
  /** @default 56 */
  size?: number
  /** @default 5 */
  strokeWidth?: number
  /** Read by screen readers. Pass a translated string. */
  accessibilityLabel?: string
}

/**
 * A ring that fills clockwise from the top on a timer. Drawn with two clipped,
 * rotating half rings so it needs no SVG.
 */
export function CircularProgress({
  durationMs = 2_500,
  size = 56,
  strokeWidth = 5,
  accessibilityLabel,
}: CircularProgressProps) {
  const { themed } = useAppTheme()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withSequence(
      withTiming(FAST_FILL, { duration: durationMs, easing: Easing.out(Easing.cubic) }),
      withTiming(SLOW_FILL, { duration: SLOW_FILL_DURATION_MS, easing: Easing.linear }),
    )
  }, [durationMs, progress])

  const $rightHalfRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.min(progress.value, 0.5) * 360}deg` }],
  }))
  const $leftHalfRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${Math.max(progress.value - 0.5, 0) * 360}deg` }],
  }))

  const half = size / 2
  const $box: ViewStyle = { width: size, height: size }
  const $halfBox: ViewStyle = {
    position: "absolute",
    top: 0,
    width: half,
    height: size,
    overflow: "hidden",
  }
  const $frame: ViewStyle = { position: "absolute", top: 0, width: size, height: size }
  const $ringShape: ViewStyle = {
    width: size,
    height: size,
    borderRadius: half,
    borderWidth: strokeWidth,
  }

  const $themedTrack = useMemo(() => themed($track), [themed])
  const $themedFill = useMemo(() => themed($fill), [themed])

  return (
    <View
      style={$box}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={[$ringShape, $themedTrack]} />
      <View style={[$halfBox, { left: half }]}>
        <Animated.View style={[$frame, { left: -half }, $rightHalfRotation]}>
          <View style={[$halfBox, { left: 0 }]}>
            <View style={[$ringShape, $themedFill]} />
          </View>
        </Animated.View>
      </View>
      <View style={[$halfBox, { left: 0 }]}>
        <Animated.View style={[$frame, { left: 0 }, $leftHalfRotation]}>
          <View style={[$halfBox, { left: half }]}>
            <View style={[$ringShape, $themedFill, { marginLeft: -half }]} />
          </View>
        </Animated.View>
      </View>
    </View>
  )
}

// #region Styles

const $track: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  borderColor: theme.colors.tintInactive,
})

const $fill: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.tint,
})

// #endregion
