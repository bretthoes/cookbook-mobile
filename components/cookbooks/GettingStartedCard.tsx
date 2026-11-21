import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { translate, type TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { timing } from "@/theme/timing"
import { useAppTheme } from "@/theme/context"
import { GETTING_STARTED_STEPS, type GettingStartedStep } from "@/utils/gettingStarted"
import { storage } from "@/utils/storage"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMMKVBoolean } from "react-native-mmkv"
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import {
  Pressable,
  View,
  type LayoutChangeEvent,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const EXPANDED_KEY = "gettingStarted.expanded"
const TOGGLE_MS = 220

const STEP_TX: Record<GettingStartedStep, TxKeyPath> = {
  cookbook: "gettingStarted:createCookbook",
  recipe: "gettingStarted:addRecipe",
  invite: "gettingStarted:invite",
}

export interface GettingStartedCardProps {
  /** Every step is listed. Locked ones are greyed out and can't be opened. */
  unlocked: Record<GettingStartedStep, boolean>
  done: Record<GettingStartedStep, boolean>
  pendingCount: number
  exiting?: boolean
  onShowGuide: (step: GettingStartedStep) => void
  onDismiss: () => void
}

export function GettingStartedCard({
  unlocked,
  done,
  pendingCount,
  exiting = false,
  onShowGuide,
  onDismiss,
}: GettingStartedCardProps) {
  const { themed, theme } = useAppTheme()
  const [expanded = true, setExpanded] = useMMKVBoolean(EXPANDED_KEY, storage)
  const [closing, setClosing] = useState(false)
  const isExiting = exiting || closing
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss
  const startedExit = useRef(false)
  const didMountExpanded = useRef(false)
  const collapsing = useSharedValue(0)
  const opacity = useSharedValue(1)
  const height = useSharedValue(0)
  const expandedProgress = useSharedValue(expanded ? 1 : 0)
  const bodyHeight = useSharedValue(0)

  const $themedCard = useMemo(() => themed($card), [themed])
  const $themedHeader = useMemo(() => themed($header), [themed])
  const $themedDescription = useMemo(() => themed($description), [themed])
  const $themedDismiss = useMemo(() => themed($dismiss), [themed])
  const $themedPending = useMemo(() => themed($pending), [themed])
  const $themedPendingText = useMemo(() => themed($pendingText), [themed])
  const animatedStyle = useAnimatedStyle(() => {
    if (collapsing.value === 0) return { opacity: opacity.value }
    return {
      height: height.value,
      opacity: opacity.value,
      overflow: "hidden",
    }
  })
  const bodyStyle = useAnimatedStyle(() => {
    if (bodyHeight.value === 0) {
      return expandedProgress.value === 0 ? { height: 0, overflow: "hidden" } : {}
    }
    return {
      height: bodyHeight.value * expandedProgress.value,
      opacity: expandedProgress.value,
      overflow: "hidden",
    }
  })
  const caretStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${expandedProgress.value * 180}deg` }],
  }))

  useEffect(() => {
    if (!didMountExpanded.current) {
      didMountExpanded.current = true
      expandedProgress.value = expanded ? 1 : 0
      return
    }
    expandedProgress.value = withTiming(expanded ? 1 : 0, { duration: TOGGLE_MS })
  }, [expanded, expandedProgress])

  useEffect(() => {
    if (!isExiting || startedExit.current) return
    startedExit.current = true
    const finish = () => onDismissRef.current()
    if (height.value > 0) {
      collapsing.value = 1
      height.value = withTiming(0, { duration: timing.quick })
    }
    opacity.value = withTiming(0, { duration: timing.quick }, (finished) => {
      if (finished) runOnJS(finish)()
    })
  }, [collapsing, height, isExiting, opacity])

  const toggleExpanded = () => {
    if (isExiting) return
    setExpanded(!expanded)
  }

  const onLayout = (event: LayoutChangeEvent) => {
    if (startedExit.current) return
    height.value = event.nativeEvent.layout.height
  }

  const onBodyLayout = (event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.height
    // Keep the full content height. A clipped layout pass reports a smaller value and would
    // leave nothing to expand back open.
    if (next > bodyHeight.value + 1) bodyHeight.value = next
  }

  return (
    <Animated.View
      style={animatedStyle}
      onLayout={onLayout}
      pointerEvents={isExiting ? "none" : "auto"}
    >
      <View style={$themedCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={translate("gettingStarted:title")}
          accessibilityHint={translate("gettingStarted:pendingA11y", { count: pendingCount })}
          onPress={toggleExpanded}
          style={({ pressed }) => [$themedHeader, pressed && $headerPressed]}
        >
          {pendingCount > 0 ? (
            <View style={$themedPending} accessibilityElementsHidden importantForAccessibility="no">
              <Text text={String(pendingCount)} size="xxs" style={$themedPendingText} />
            </View>
          ) : null}
          <View style={$titleWrap}>
            <Text tx="gettingStarted:title" size="sm" weight="medium" />
          </View>
          <Animated.View style={caretStyle}>
            <Icon icon="caretDown" size={18} color={theme.colors.textDim} />
          </Animated.View>
        </Pressable>
        <Animated.View style={bodyStyle} pointerEvents={expanded ? "auto" : "none"}>
          <View onLayout={onBodyLayout} style={{ position: "absolute", left: 0, right: 0, top: 0 }}>
            <Text tx="gettingStarted:description" style={$themedDescription} />
            {GETTING_STARTED_STEPS.map((step) => (
              <StepRow
                key={step}
                tx={STEP_TX[step]}
                done={done[step]}
                locked={!unlocked[step] && !done[step]}
                onPress={() => onShowGuide(step)}
              />
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setClosing(true)}
              hitSlop={8}
              style={$dismissPressable}
            >
              <Text tx="gettingStarted:exploreOnMyOwn" style={$themedDismiss} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Animated.View>
  )
}

function StepRow({
  tx,
  done,
  locked,
  onPress,
}: {
  tx: TxKeyPath
  done: boolean
  locked: boolean
  onPress: () => void
}) {
  const { themed, theme } = useAppTheme()
  const $themedStep = useMemo(() => themed($step), [themed])
  const $themedBadge = useMemo(() => themed(done ? $stepBadgeDone : $stepBadge), [themed, done])
  const $themedCopy = useMemo(() => themed($stepCopy), [themed])
  const $themedLockedText = useMemo(() => themed($stepLockedText), [themed])

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: done || locked, checked: done }}
      disabled={done || locked}
      onPress={onPress}
      style={[$themedStep, locked && $stepLocked]}
    >
      <View style={$themedBadge}>
        {done ? <Icon icon="check" size={16} color={theme.colors.tint} /> : null}
      </View>
      <View style={$themedCopy}>
        <Text tx={tx} style={locked ? $themedLockedText : undefined} />
      </View>
      {done ? null : locked ? (
        <Icon icon="lock" size={16} color={theme.colors.textDim} />
      ) : (
        <Icon icon="caretRight" size={20} color={theme.colors.textDim} />
      )}
    </Pressable>
  )
}

// #region Styles
const $card: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderWidth: 1,
  borderColor: theme.colors.separator,
  borderRadius: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  marginTop: theme.spacing.lg,
  marginBottom: 0,
})

const $header: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.xs,
})

const $headerPressed: ViewStyle = {
  opacity: 0.55,
}

const $pending: ThemedStyle<ViewStyle> = (theme) => ({
  minWidth: theme.spacing.md,
  height: theme.spacing.md,
  borderRadius: theme.spacing.xs,
  paddingHorizontal: theme.spacing.xxs,
  backgroundColor: theme.colors.tint,
  alignItems: "center",
  justifyContent: "center",
})

const $pendingText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
  lineHeight: theme.spacing.md,
})

const $titleWrap: ViewStyle = {
  flex: 1,
}

const $description: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xs,
  marginBottom: theme.spacing.sm,
})

const $step: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: theme.spacing.sm,
  gap: theme.spacing.sm,
})

const $stepBadge: ThemedStyle<ViewStyle> = (theme) => ({
  width: theme.spacing.xl,
  height: theme.spacing.xl,
  borderRadius: theme.spacing.md,
  borderWidth: 1,
  borderColor: theme.colors.border,
  alignItems: "center",
  justifyContent: "center",
})

const $stepBadgeDone: ThemedStyle<ViewStyle> = (theme) => ({
  width: theme.spacing.xl,
  height: theme.spacing.xl,
  borderRadius: theme.spacing.md,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
})

const $stepCopy: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $stepLocked: ViewStyle = {
  opacity: 0.5,
}

const $stepLockedText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $dismissPressable: ViewStyle = {
  alignSelf: "center",
}

const $dismiss: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
  textAlign: "center",
  marginTop: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
})
// #endregion
