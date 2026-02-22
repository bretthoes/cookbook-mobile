import { isRTL, TxKeyPath } from "@/i18n"
import { ListItem } from "@/components/ListItem"
import type { IconTypes } from "@/components/Icon"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useEffect, useMemo } from "react"
import { Modal, Pressable, TextStyle, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const HEADER_HEIGHT = 56

const ABSOLUTE_FILL: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
}

export interface CookbookDetailPopoverOption {
  key: string
  tx: TxKeyPath
  leftIcon: IconTypes
  destructive?: boolean
  disabled?: boolean
  onPress: () => void
}

export interface CookbookDetailPopoverProps {
  visible: boolean
  onDismiss: () => void
  options: CookbookDetailPopoverOption[]
  /** Override top position (e.g. for screens without a header). Default: insets.top + 56 */
  anchorTop?: number
}

export function CookbookDetailPopover(props: CookbookDetailPopoverProps) {
  const { visible, onDismiss, options, anchorTop: anchorTopOverride } = props
  const { themed, theme } = useAppTheme()
  const insets = useSafeAreaInsets()

  const overlayOpacity = useSharedValue(0)
  const popoverOpacity = useSharedValue(0)
  const popoverTranslateY = useSharedValue(-8)

  const $themedOverlay = useMemo(() => themed($overlay), [themed])
  const $themedPopover = useMemo(() => themed($popover), [themed])
  const $themedPopoverItem = useMemo(() => themed($popoverItem), [themed])
  const $themedPopoverItemDestructive = useMemo(
    () => themed($popoverItemDestructive),
    [themed],
  )
  const $themedDestructiveText = useMemo(
    () => themed($destructiveText(theme.colors.error)),
    [themed, theme.colors.error],
  )
  const $themedDisabledText = useMemo(
    () => themed($disabledText(theme.colors.textDim)),
    [themed, theme.colors.textDim],
  )

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const popoverAnimatedStyle = useAnimatedStyle(() => ({
    opacity: popoverOpacity.value,
    transform: [{ translateY: popoverTranslateY.value }],
  }))

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = 0
      popoverOpacity.value = 0
      popoverTranslateY.value = -8
      overlayOpacity.value = withTiming(1, { duration: 150 })
      popoverOpacity.value = withTiming(1, { duration: 150 })
      popoverTranslateY.value = withTiming(0, { duration: 150 })
    }
  }, [visible])

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 120 })
    popoverOpacity.value = withTiming(0, { duration: 120 })
    popoverTranslateY.value = withTiming(-8, { duration: 120 })
    setTimeout(onDismiss, 120)
  }

  const handleOptionPress = (opt: CookbookDetailPopoverOption) => {
    if (opt.disabled) return
    handleDismiss()
    opt.onPress()
  }

  const popoverTop =
    anchorTopOverride ?? insets.top + HEADER_HEIGHT + theme.spacing.xs
  const popoverRight = theme.spacing.md
  const popoverLeft = isRTL ? popoverRight : undefined
  const popoverRightRTL = isRTL ? undefined : popoverRight

  if (!visible) return null

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <Animated.View style={[$themedOverlay, overlayAnimatedStyle]} collapsable={false}>
        <Pressable style={ABSOLUTE_FILL} onPress={handleDismiss} />
      </Animated.View>
      <Animated.View
        style={[
          $themedPopover,
          popoverAnimatedStyle,
          {
            top: popoverTop,
            right: popoverRightRTL,
            left: popoverLeft,
          },
        ]}
      >
        {options.map((opt) => (
          <ListItem
            key={opt.key}
            tx={opt.tx}
            leftIcon={opt.leftIcon}
            leftIconColor={
              opt.disabled
                ? theme.colors.textDim
                : opt.destructive
                  ? theme.colors.error
                  : undefined
            }
            textStyle={
              opt.disabled
                ? $themedDisabledText
                : opt.destructive
                  ? $themedDestructiveText
                  : undefined
            }
            disabled={opt.disabled}
            onPress={() => handleOptionPress(opt)}
            style={
              opt.destructive ? $themedPopoverItemDestructive : $themedPopoverItem
            }
          />
        ))}
      </Animated.View>
    </Modal>
  )
}

const $overlay: ThemedStyle<ViewStyle> = (theme) => ({
  ...ABSOLUTE_FILL,
  backgroundColor:
    (theme.colors as { palette?: { overlay50?: string } }).palette?.overlay50 ??
    "rgba(0,0,0,0.5)",
})

const $popover: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.xs,
  borderWidth: 1,
  borderColor: theme.colors.border,
  minWidth: 200,
  overflow: "hidden",
})

const $popoverItem: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: "transparent",
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  paddingLeft: theme.spacing.md,
})

const $popoverItemDestructive: ThemedStyle<ViewStyle> = (theme) => ({
  ...$popoverItem(theme),
})

const $destructiveText =
  (errorColor: string): ThemedStyle<TextStyle> =>
  () => ({
    color: errorColor,
  })

const $disabledText =
  (dimColor: string): ThemedStyle<TextStyle> =>
  () => ({
    color: dimColor,
  })
