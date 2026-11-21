import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useMemo, type ReactNode, type RefObject } from "react"
import { TouchableOpacity, View, type ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const SIZE = 56
const PLUS_LENGTH = 22
const PLUS_THICKNESS = 3

export interface FloatingActionButtonProps {
  onPress: () => void
  accessibilityLabel: string
  /** Defaults to a plus sign. */
  children?: ReactNode
  disabled?: boolean
  /** `outline` (default) is the quiet add button; `filled` is for buttons with their own artwork. */
  variant?: "outline" | "filled"
  /** Distance from the bottom edge, on top of the safe-area inset. */
  bottomOffset?: number
  /** Skip the bottom safe-area inset when something below (a tab bar) already accounts for it. */
  ignoreBottomInset?: boolean
  anchorRef?: RefObject<View | null>
  onAnchorLayout?: () => void
}

/** Round button pinned to the bottom-right corner of its parent. */
export function FloatingActionButton({
  onPress,
  accessibilityLabel,
  children,
  disabled = false,
  variant = "outline",
  bottomOffset,
  ignoreBottomInset = false,
  anchorRef,
  onAnchorLayout,
}: FloatingActionButtonProps) {
  const { themed, theme } = useAppTheme()
  const insets = useSafeAreaInsets()
  const isFilled = variant === "filled"
  const $themedFab = useMemo(
    () => themed([$fab, isFilled ? $fabFilled : $fabOutline]),
    [themed, isFilled],
  )
  const plusColor = isFilled ? colors.palette.neutral100 : theme.colors.tint
  const bottom = (ignoreBottomInset ? 0 : insets.bottom) + (bottomOffset ?? theme.spacing.lg)

  return (
    <View
      ref={anchorRef}
      onLayout={onAnchorLayout}
      collapsable={false}
      style={[$wrapper, { bottom, right: theme.spacing.lg }]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={[$themedFab, disabled && $disabled]}
      >
        {children ?? (
          <View style={$plus} pointerEvents="none">
            <View style={[$plusBar, $plusHorizontal, { backgroundColor: plusColor }]} />
            <View style={[$plusBar, $plusVertical, { backgroundColor: plusColor }]} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

// #region Styles
const $wrapper: ViewStyle = {
  position: "absolute",
  zIndex: 10,
}

const $fab: ThemedStyle<ViewStyle> = () => ({
  width: SIZE,
  height: SIZE,
  borderRadius: SIZE / 2,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
})

const $fabFilled: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  elevation: 6,
  shadowOpacity: 0.25,
  shadowRadius: 4,
})

const $fabOutline: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  borderWidth: 2,
  borderColor: theme.colors.tint,
  elevation: 3,
  shadowOpacity: 0.12,
  shadowRadius: 3,
})

const $disabled: ViewStyle = {
  opacity: 0.55,
}

const $plus: ViewStyle = {
  width: PLUS_LENGTH,
  height: PLUS_LENGTH,
  alignItems: "center",
  justifyContent: "center",
}

const $plusBar: ViewStyle = {
  position: "absolute",
  borderRadius: PLUS_THICKNESS / 2,
}

const $plusHorizontal: ViewStyle = {
  width: PLUS_LENGTH,
  height: PLUS_THICKNESS,
}

const $plusVertical: ViewStyle = {
  width: PLUS_THICKNESS,
  height: PLUS_LENGTH,
}
// #endregion
