import { useEffect, useMemo, useRef } from "react"
import {
  Animated,
  Image,
  ImageStyle,
  Platform,
  StyleProp,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { $styles } from "src/theme"
import { iconRegistry } from "src/components/Icon"
import { isRTL } from "src/i18n"
import { $inputOuterBase, BaseToggleInputProps, Toggle, ToggleProps } from "./Toggle"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

export interface SwitchToggleProps extends Omit<ToggleProps<SwitchInputProps>, "ToggleInput"> {
  /**
   * Switch-only prop that adds a text/icon label for on/off states.
   */
  accessibilityMode?: "text" | "icon"
  /**
   * Optional style prop that affects the knob View.
   * Note: `width` and `height` rules should be points (numbers), not percentages.
   */
  inputDetailStyle?: Omit<ViewStyle, "width" | "height"> & { width?: number; height?: number }
}

interface SwitchInputProps extends BaseToggleInputProps<SwitchToggleProps> {
  accessibilityMode?: SwitchToggleProps["accessibilityMode"]
}

/**
 * @param {SwitchToggleProps} props - The props for the `Switch` component.
 * @returns {JSX.Element} The rendered `Switch` component.
 */
export function Switch(props: SwitchToggleProps) {
  return <Toggle accessibilityRole="switch" {...props} ToggleInput={SwitchInput} />
}

function SwitchInput(props: SwitchInputProps) {
  const {
    on,
    status,
    disabled,
    outerStyle: $outerStyleOverride,
    innerStyle: $innerStyleOverride,
    detailStyle: $detailStyleOverride,
  } = props

  const {
    theme: { colors },
    themed,
  } = useAppTheme()

  const animate = useRef(new Animated.Value(on ? 1 : 0)) // Initial value is set based on isActive
  const opacity = useRef(new Animated.Value(0))

  useEffect(() => {
    Animated.timing(animate.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true, // Enable native driver for smoother animations
    }).start()
  }, [on])

  useEffect(() => {
    Animated.timing(opacity.current, {
      toValue: on ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [on])

  const knobSizeFallback = 2

  const knobWidth = [$detailStyleOverride?.width, $switchDetail?.width, knobSizeFallback].find(
    (v) => typeof v === "number",
  )

  const knobHeight = [$detailStyleOverride?.height, $switchDetail?.height, knobSizeFallback].find(
    (v) => typeof v === "number",
  )

  const offBackgroundColor = [
    disabled && colors.border,
    status === "error" && colors.errorBackground,
    colors.border,
  ].filter(Boolean)[0]

  const onBackgroundColor = [
    disabled && colors.transparent,
    status === "error" && colors.errorBackground,
    colors.palette.primary400,
  ].filter(Boolean)[0]

  const knobBackgroundColor = (function () {
    if (on) {
      return [
        $detailStyleOverride?.backgroundColor,
        status === "error" && colors.error,
        disabled && colors.textDim,
        colors.backgroundDim,
      ].filter(Boolean)[0]
    } else {
      return [
        $innerStyleOverride?.backgroundColor,
        disabled && colors.textDim,
        status === "error" && colors.error,
        colors.background,
      ].filter(Boolean)[0]
    }
  })()

  const rtlAdjustment = isRTL ? -1 : 1
  const $themedSwitchInner: StyleProp<ViewStyle> = useMemo(
    () => themed([$styles.toggleInner, $switchInner]),
    [themed],
  )

  const getStyleValue = (style: StyleProp<ViewStyle>) => {
    if (style && typeof style === "object" && !Array.isArray(style)) {
      return style as ViewStyle
    }
    return {}
  }

  const innerStyle = getStyleValue($themedSwitchInner)
  const overrideStyle = getStyleValue($innerStyleOverride)

  const offsetLeft = (overrideStyle.paddingStart ||
    overrideStyle.paddingLeft ||
    innerStyle.paddingStart ||
    innerStyle.paddingLeft ||
    0) as number

  const offsetRight = (overrideStyle.paddingEnd ||
    overrideStyle.paddingRight ||
    innerStyle.paddingEnd ||
    innerStyle.paddingRight ||
    0) as number

  const outputRange =
    Platform.OS === "web"
      ? isRTL
        ? [+(knobWidth || 0) + offsetRight, offsetLeft]
        : [offsetLeft, +(knobWidth || 0) + offsetRight]
      : [rtlAdjustment * offsetLeft, rtlAdjustment * (+(knobWidth || 0) + offsetRight)]

  const $animatedSwitchKnob = animate.current.interpolate({
    inputRange: [0, 1],
    outputRange,
  })

  return (
    <View style={[$inputOuter, { backgroundColor: offBackgroundColor }, $outerStyleOverride]}>
      <Animated.View
        style={[
          $themedSwitchInner,
          { backgroundColor: onBackgroundColor },
          $innerStyleOverride,
          { opacity: opacity.current },
        ]}
      />

      <SwitchAccessibilityLabel {...props} role="on" />
      <SwitchAccessibilityLabel {...props} role="off" />

      <Animated.View
        style={[
          $switchDetail,
          $detailStyleOverride,
          { transform: [{ translateX: $animatedSwitchKnob }] },
          { width: knobWidth, height: knobHeight },
          { backgroundColor: knobBackgroundColor },
        ]}
      />
    </View>
  )
}

/**
 * @param {ToggleInputProps & { role: "on" | "off" }} props - The props for the `SwitchAccessibilityLabel` component.
 * @returns {JSX.Element} The rendered `SwitchAccessibilityLabel` component.
 */
function SwitchAccessibilityLabel(props: SwitchInputProps & { role: "on" | "off" }) {
  const { on, disabled, status, accessibilityMode, role, innerStyle, detailStyle } = props

  const {
    theme: { colors },
  } = useAppTheme()

  if (!accessibilityMode) return null

  const shouldLabelBeVisible = (on && role === "on") || (!on && role === "off")

  const $switchAccessibilityStyle: StyleProp<ViewStyle> = [
    $switchAccessibility,
    role === "off" && { end: "5%" },
    role === "on" && { left: "5%" },
  ]

  const color = (function () {
    if (disabled) return colors.textDim
    if (status === "error") return colors.error
    if (!on) return innerStyle?.backgroundColor || colors.palette.secondary500
    return detailStyle?.backgroundColor || colors.backgroundDim
  })()

  return (
    <View style={$switchAccessibilityStyle}>
      {accessibilityMode === "text" && shouldLabelBeVisible && (
        <View
          style={[
            role === "on" && $switchAccessibilityLine,
            role === "on" && { backgroundColor: color },
            role === "off" && $switchAccessibilityCircle,
            role === "off" && { borderColor: color },
          ]}
        />
      )}

      {accessibilityMode === "icon" && shouldLabelBeVisible && (
        <Image
          style={[$switchAccessibilityIcon, { tintColor: color }]}
          source={role === "off" ? iconRegistry.hidden : iconRegistry.view}
        />
      )}
    </View>
  )
}

const $inputOuter: StyleProp<ViewStyle> = [
  $inputOuterBase,
  { height: 32, width: 56, borderRadius: 16, borderWidth: 0 },
]

const $switchInner: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.transparent,
  position: "absolute",
  paddingStart: 4,
  paddingEnd: 4,
})

const $switchDetail: SwitchToggleProps["inputDetailStyle"] = {
  borderRadius: 12,
  position: "absolute",
  width: 24,
  height: 24,
}

const $switchAccessibility: TextStyle = {
  width: "40%",
  justifyContent: "center",
  alignItems: "center",
}

const $switchAccessibilityIcon: ImageStyle = {
  width: 14,
  height: 14,
  resizeMode: "contain",
}

const $switchAccessibilityLine: ViewStyle = {
  width: 2,
  height: 12,
}

const $switchAccessibilityCircle: ViewStyle = {
  borderWidth: 2,
  width: 12,
  height: 12,
  borderRadius: 6,
}
