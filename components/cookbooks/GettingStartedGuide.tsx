import { guideCaptionFitsBelow } from "@/components/cookbooks/guideCaptionFitsBelow"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react"
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"

export interface GuideTarget {
  x: number
  y: number
  width: number
  height: number
}

export function useGuideAnchor(active: boolean): {
  ref: RefObject<View | null>
  target: GuideTarget | null
  onLayout: () => void
} {
  const ref = useRef<View>(null)
  const [target, setTarget] = useState<GuideTarget | null>(null)
  const measure = useCallback(() => {
    const node = ref.current
    if (!node) return
    node.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return
      setTarget({ x, y, width, height })
    })
  }, [])

  useEffect(() => {
    if (!active) {
      setTarget(null)
      return
    }
    const frame = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(frame)
  }, [active, measure])

  return { ref, target, onLayout: measure }
}

export function GettingStartedGuide({
  messageTx,
  primaryTx,
  target = null,
  revealScreen = false,
  pinToBottom = false,
  placeAbove = false,
  onPrimary,
  onClose,
}: {
  messageTx: TxKeyPath
  primaryTx?: TxKeyPath
  target?: GuideTarget | null
  /** Shows the screen through a light scrim instead of spotlighting one control. */
  revealScreen?: boolean
  /** Bottom note with no spotlight, for a message that has no control to point at. */
  pinToBottom?: boolean
  /** Point down at the control. Use when it sits on the bottom edge. */
  placeAbove?: boolean
  onPrimary?: () => void
  onClose: () => void
}) {
  const { themed, theme } = useAppTheme()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const rootRef = useRef<View>(null)
  const [frame, setFrame] = useState({ x: 0, y: 0, height: 0 })
  const pulse = useSharedValue(0)
  const $themedDim = useMemo(() => themed($dim), [themed])
  const $themedScrim = useMemo(() => themed($scrim), [themed])
  const $themedCaption = useMemo(() => themed($caption), [themed])
  const $themedCopy = useMemo(() => themed($copy), [themed])
  const $themedArrowUp = useMemo(() => themed($arrowUp), [themed])
  const $themedArrowDown = useMemo(() => themed($arrowDown), [themed])
  const $themedAction = useMemo(() => themed($action), [themed])
  const $themedActionText = useMemo(() => themed($actionText), [themed])
  const $themedRing = useMemo(() => themed($ring), [themed])
  const $themedPulse = useMemo(() => themed($pulse), [themed])

  const measureOrigin = useCallback((event?: LayoutChangeEvent) => {
    // `top` is relative to this view's layout box. measureInWindow's height can
    // include space under the tab bar, which drops the note out of sight.
    const layoutHeight = event?.nativeEvent.layout.height
    rootRef.current?.measureInWindow((x, y) => {
      setFrame((current) => {
        const height = layoutHeight ?? current.height
        return current.x === x && current.y === y && current.height === height
          ? current
          : { x, y, height }
      })
    })
  }, [])

  useEffect(() => {
    if (!target || revealScreen) {
      pulse.value = 0
      return
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [pulse, revealScreen, target])

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + pulse.value * 0.45,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }))

  const pad = theme.spacing.xs
  // Window coordinates are meaningless until this overlay has been laid out.
  // Showing the note earlier parks it beside the button, then it jumps.
  const measured = frame.height > 0
  // A header control sits above this overlay. It stays lit, and the note points up at it.
  const targetAbove = Boolean(measured && target && target.y + target.height <= frame.y)
  const hole =
    measured && target && !targetAbove
      ? {
          x: Math.max(0, target.x - frame.x - pad),
          y: Math.max(0, target.y - frame.y - pad),
          width: target.width + pad * 2,
          height: target.height + pad * 2,
        }
      : null
  const pointAt = hole
    ? { x: hole.x, width: hole.width }
    : target && targetAbove
      ? { x: target.x - frame.x, width: target.width }
      : null

  // Compact coach mark — sits near the highlight, not a full-width card.
  // Flip above when the note would run into the overlay edge or the nav bar.
  // The floating + buttons pass placeAbove so they always point from the top.
  const maxCaption = Math.min(260, windowWidth - theme.spacing.xl * 2)
  const estimatedCaption = primaryTx ? 104 : 60
  const fitsBelow =
    !hole ||
    guideCaptionFitsBelow({
      holeBottom: hole.y + hole.height,
      captionHeight: estimatedCaption,
      gap: theme.spacing.sm,
      overlayTop: frame.y,
      overlayHeight: frame.height,
      windowHeight,
      bottomInset: insets.bottom,
      edgeMargin: theme.spacing.sm,
    })
  // A target at the top has nowhere to put the note above it. Covering the
  // control is worse than sitting underneath.
  const fitsAbove = !hole || hole.y >= estimatedCaption + theme.spacing.xs + theme.spacing.md
  const placeBelow = !placeAbove && (fitsBelow || !fitsAbove)
  const captionTop = hole
    ? placeBelow
      ? hole.y + hole.height + theme.spacing.xs
      : Math.max(theme.spacing.md, hole.y - estimatedCaption - theme.spacing.xs)
    : targetAbove
      ? theme.spacing.xs
      : undefined
  const captionLeft = pointAt
    ? Math.min(
        Math.max(theme.spacing.md, pointAt.x + pointAt.width / 2 - maxCaption / 2),
        windowWidth - maxCaption - theme.spacing.md,
      )
    : theme.spacing.lg
  const arrowOffset = pointAt
    ? Math.min(
        Math.max(theme.spacing.sm, pointAt.x + pointAt.width / 2 - captionLeft - 5),
        maxCaption - theme.spacing.md,
      )
    : 0
  const showArrowUp = (hole && placeBelow) || targetAbove
  const showNote = revealScreen || pinToBottom || (measured && target != null)

  return (
    <View ref={rootRef} pointerEvents="box-none" style={$fill} onLayout={measureOrigin}>
      {revealScreen ? (
        <Pressable
          accessible={false}
          onPress={onClose}
          style={[$themedScrim, { top: 0, left: 0, right: 0, bottom: 0 }]}
        />
      ) : hole ? (
        <>
          <Pressable
            accessible={false}
            onPress={onClose}
            style={[$themedDim, { top: 0, left: 0, right: 0, height: hole.y }]}
          />
          <Pressable
            accessible={false}
            onPress={onClose}
            style={[$themedDim, { top: hole.y, left: 0, width: hole.x, height: hole.height }]}
          />
          <Pressable
            accessible={false}
            onPress={onClose}
            style={[
              $themedDim,
              { top: hole.y, left: hole.x + hole.width, right: 0, height: hole.height },
            ]}
          />
          <Pressable
            accessible={false}
            onPress={onClose}
            style={[$themedDim, { top: hole.y + hole.height, left: 0, right: 0, bottom: 0 }]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              $themedPulse,
              pulseStyle,
              { top: hole.y, left: hole.x, width: hole.width, height: hole.height },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              $themedRing,
              { top: hole.y, left: hole.x, width: hole.width, height: hole.height },
            ]}
          />
        </>
      ) : (
        <Pressable
          accessible={false}
          onPress={onClose}
          style={[$themedDim, { top: 0, left: 0, right: 0, bottom: 0 }]}
        />
      )}
      {showNote ? (
        <View
          pointerEvents="box-none"
          style={[
            $note,
            { left: captionLeft, maxWidth: maxCaption },
            captionTop === undefined ? { bottom: theme.spacing.xl } : { top: captionTop },
          ]}
        >
          {showArrowUp ? (
            <View pointerEvents="none" style={[$themedArrowUp, { marginLeft: arrowOffset }]} />
          ) : null}
          <View pointerEvents="none" style={$themedCaption} accessibilityRole="text">
            <Text tx={messageTx} size="sm" style={$themedCopy} />
          </View>
          {hole && !placeBelow ? (
            <View pointerEvents="none" style={[$themedArrowDown, { marginLeft: arrowOffset }]} />
          ) : null}
          {primaryTx && onPrimary ? (
            <Pressable
              accessibilityRole="button"
              onPress={onPrimary}
              hitSlop={8}
              style={$themedAction}
            >
              <Text tx={primaryTx} size="sm" weight="medium" style={$themedActionText} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

const $fill: ViewStyle = {
  ...StyleSheet.absoluteFill,
  zIndex: 20,
}

const $dim: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  backgroundColor: theme.colors.palette.overlay20,
})

const $scrim: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  backgroundColor: theme.colors.palette.overlay20,
})

const $ring: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  borderWidth: 2,
  borderColor: theme.colors.tint,
  borderRadius: theme.spacing.sm,
})

const $pulse: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  borderWidth: 2,
  borderColor: theme.colors.tint,
  borderRadius: theme.spacing.sm,
  backgroundColor: theme.colors.transparent,
})

const $note: ViewStyle = {
  position: "absolute",
  alignItems: "flex-start",
}

/** Soft caption — reads as a tip, not a tappable control. */
const $caption: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderLeftWidth: 3,
  borderLeftColor: theme.colors.tint,
  borderRadius: theme.spacing.xxs,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
  // Lift without the heavy fill of a button.
  shadowColor: theme.colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme.isDark ? 0.35 : 0.12,
  shadowRadius: 4,
  elevation: 3,
})

const $copy: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $arrowUp: ThemedStyle<ViewStyle> = (theme) => ({
  width: 0,
  height: 0,
  borderLeftWidth: 5,
  borderRightWidth: 5,
  borderBottomWidth: 6,
  borderLeftColor: theme.colors.transparent,
  borderRightColor: theme.colors.transparent,
  borderBottomColor: theme.colors.backgroundDim,
  marginBottom: -1,
})

const $arrowDown: ThemedStyle<ViewStyle> = (theme) => ({
  width: 0,
  height: 0,
  borderLeftWidth: 5,
  borderRightWidth: 5,
  borderTopWidth: 6,
  borderLeftColor: theme.colors.transparent,
  borderRightColor: theme.colors.transparent,
  borderTopColor: theme.colors.backgroundDim,
  marginTop: -1,
})

const $action: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.xs,
  paddingVertical: theme.spacing.xxs,
  paddingHorizontal: theme.spacing.xxs,
  alignSelf: "flex-start",
})

const $actionText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
})
