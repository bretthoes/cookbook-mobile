import { Text } from "@/components/Text"
import { useLayoutEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { TextStyle, View, ViewStyle } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"

const MADE_COUNT_TICK_MS = 200
const MADE_COUNT_TICK_DELAY_MS = 220

function splitMadeCountLabel(label: string, count: number) {
  const countLabel = String(count)
  const countIndex = label.indexOf(countLabel)
  if (countIndex < 0) return null
  return {
    before: label.slice(0, countIndex),
    after: label.slice(countIndex + countLabel.length),
  }
}

export function MadeCountLabel({ count, recipeId }: { count: number; recipeId: string }) {
  const { t } = useTranslation()
  const label = t("recipeDetailsScreen:madeCount", { count })
  const parts = splitMadeCountLabel(label, count)

  if (!parts) {
    return <Text tx="recipeDetailsScreen:madeCount" txOptions={{ count }} style={$madeCountText} />
  }

  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={$madeCountRow}>
      {parts.before ? <Text text={parts.before} /> : null}
      <RollingNumber key={recipeId} value={count} />
      {parts.after ? <Text text={parts.after} /> : null}
    </View>
  )
}

function RollingNumber({ value }: { value: number }) {
  const [from, setFrom] = useState(value)
  const [lineHeight, setLineHeight] = useState(0)
  const offset = useSharedValue(0)

  useLayoutEffect(() => {
    if (from === value) return
    if (lineHeight <= 0) {
      setFrom(value)
      return
    }
    offset.value = 0
    offset.value = withDelay(
      MADE_COUNT_TICK_DELAY_MS,
      withTiming(
        -lineHeight,
        { duration: MADE_COUNT_TICK_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(setFrom)(value)
        },
      ),
    )
    return () => {
      cancelAnimation(offset)
    }
  }, [from, lineHeight, offset, value])

  const $tick = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }))

  const onMeasure = (height: number) => {
    const next = Math.ceil(height)
    setLineHeight((current) => (current === next ? current : next))
  }

  if (lineHeight <= 0) {
    return (
      <Text text={String(value)} onLayout={(event) => onMeasure(event.nativeEvent.layout.height)} />
    )
  }

  return (
    <View style={[$tickWindow, { height: lineHeight }]} collapsable={false}>
      <Animated.View style={[$tickColumn, $tick]}>
        <Text
          text={String(from)}
          onLayout={(event) => onMeasure(event.nativeEvent.layout.height)}
        />
        <Text text={String(value)} />
      </Animated.View>
    </View>
  )
}

const $madeCountRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
}

const $tickWindow: ViewStyle = {
  overflow: "hidden",
}

const $tickColumn: ViewStyle = {
  alignItems: "center",
}

const $madeCountText: TextStyle = {
  textAlign: "center",
}
