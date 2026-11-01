import { CustomBackButton } from "@/components/CustomBackButton"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useEffect, useMemo } from "react"
import { View, ViewStyle } from "react-native"
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

/** Trailing space so ingredient lines end at different lengths without overflowing. */
const INGREDIENT_TRAILING = [spacing.xl, spacing.xxl, spacing.md, spacing.xxxl] as const
const DIRECTION_WIDTHS = ["92%", "80%", "68%"] as const

export interface RecipeDetailsSkeletonProps {
  /** Title already known from the cookbook list. Omitted for a cold open. */
  title?: string
  onBack: () => void
}

/**
 * Recipe-shaped placeholders for a short fetch. No status label: the page
 * itself is the waiting state.
 */
export function RecipeDetailsSkeleton({ title, onBack }: RecipeDetailsSkeletonProps) {
  const { themed } = useAppTheme()
  const opacity = useSharedValue(0.55)

  const $pulse = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true)
    return () => {
      cancelAnimation(opacity)
    }
  }, [opacity])

  const $hero = useMemo(() => themed($heroStyle), [themed])
  const $rule = useMemo(() => themed($ruleStyle), [themed])
  const $bar = useMemo(() => themed($barStyle), [themed])
  const $titleBar = useMemo(() => themed($titleBarStyle), [themed])
  const $headingBar = useMemo(() => themed($headingBarStyle), [themed])
  const $authorBar = useMemo(() => themed($authorBarStyle), [themed])
  const $metaCard = useMemo(() => themed($metaCardStyle), [themed])
  const $metaBlock = useMemo(() => themed($metaBlockStyle), [themed])
  const $summary = useMemo(() => themed($summaryStyle), [themed])
  const $section = useMemo(() => themed($sectionStyle), [themed])
  const $group = useMemo(() => themed($groupStyle), [themed])
  const $line = useMemo(() => themed($lineStyle), [themed])
  const $dividedLine = useMemo(() => themed($dividedLineStyle), [themed])
  const $mark = useMemo(() => themed($markStyle), [themed])
  const $action = useMemo(() => themed($actionStyle), [themed])

  const knownTitle = title?.trim() ? title : undefined

  return (
    <Screen preset="scroll" safeAreaEdges={[]}>
      <Animated.View style={[$hero, $pulse]} />
      <CustomBackButton onPress={onBack} top={spacing.xl} />
      <View style={$rule} />

      <View style={$summary}>
        {knownTitle ? (
          <Text preset="heading" weight="normal" text={knownTitle} />
        ) : (
          <Animated.View style={[$titleBar, $pulse]} />
        )}
        <Animated.View style={[$authorBar, $pulse]} />
        <View style={$metaCard}>
          <Animated.View style={[$metaBlock, $pulse]} />
          <Animated.View style={[$metaBlock, $pulse]} />
          <Animated.View style={[$metaBlock, $pulse]} />
        </View>
        <Animated.View style={[$bar, $pulse, { width: "100%" }]} />
        <Animated.View style={[$bar, $pulse, { width: "84%" }]} />
      </View>

      <View style={$section}>
        <Animated.View style={[$headingBar, $pulse]} />
        <View style={$group}>
          {INGREDIENT_TRAILING.map((trailing, index) => (
            <View
              key={trailing}
              style={index < INGREDIENT_TRAILING.length - 1 ? $dividedLine : $line}
            >
              <Animated.View style={[$mark, $pulse]} />
              <Animated.View style={[$bar, $pulse, $lineBar, { marginRight: trailing }]} />
            </View>
          ))}
        </View>
      </View>

      <View style={$section}>
        <Animated.View style={[$headingBar, $pulse, $headingBarShort]} />
        <View style={$group}>
          {DIRECTION_WIDTHS.map((width, index) => (
            <View key={width} style={index < DIRECTION_WIDTHS.length - 1 ? $dividedLine : $line}>
              <Animated.View style={[$bar, $pulse, { width }]} />
            </View>
          ))}
        </View>
      </View>

      <View style={$section}>
        <Animated.View style={[$action, $pulse]} />
      </View>
    </Screen>
  )
}

const $lineBar: ViewStyle = {
  flex: 1,
}

const $headingBarShort: ViewStyle = {
  width: "28%",
}

// #region Styles

const $heroStyle: ThemedStyle<ViewStyle> = (theme) => ({
  width: "100%",
  aspectRatio: 4 / 3,
  backgroundColor: theme.colors.border,
})

const $ruleStyle: ThemedStyle<ViewStyle> = (theme) => ({
  height: 1,
  backgroundColor: theme.colors.separator,
  marginHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.xs,
})

const $barStyle: ThemedStyle<ViewStyle> = (theme) => ({
  height: theme.spacing.md,
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.border,
})

const $titleBarStyle: ThemedStyle<ViewStyle> = (theme) => ({
  height: theme.spacing.lg,
  width: "72%",
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.border,
})

const $headingBarStyle: ThemedStyle<ViewStyle> = (theme) => ({
  height: theme.spacing.lg,
  width: "40%",
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.border,
})

const $authorBarStyle: ThemedStyle<ViewStyle> = (theme) => ({
  height: theme.spacing.sm,
  width: "36%",
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.border,
})

const $summaryStyle: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  paddingTop: theme.spacing.sm,
  gap: theme.spacing.sm,
})

const $metaCardStyle: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-evenly",
  alignItems: "center",
  backgroundColor: theme.colors.tintInactive,
  borderRadius: theme.spacing.md,
  borderColor: theme.colors.border,
  borderWidth: theme.spacing.xxxs,
  paddingVertical: theme.spacing.md,
})

const $metaBlockStyle: ThemedStyle<ViewStyle> = (theme) => ({
  width: theme.spacing.xxl,
  height: theme.spacing.xl,
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.border,
})

const $sectionStyle: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  gap: theme.spacing.md,
})

const $groupStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.xs,
  overflow: "hidden",
})

const $lineStyle: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
})

const $dividedLineStyle: ThemedStyle<ViewStyle> = (theme) => ({
  ...$lineStyle(theme),
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.separator,
})

const $markStyle: ThemedStyle<ViewStyle> = (theme) => ({
  width: theme.spacing.lg,
  height: theme.spacing.lg,
  borderRadius: theme.spacing.xxs,
  backgroundColor: theme.colors.border,
})

const $actionStyle: ThemedStyle<ViewStyle> = (theme) => ({
  height: 56,
  borderRadius: 4,
  backgroundColor: theme.colors.border,
})

// #endregion
