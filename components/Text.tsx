import { ForwardedRef, forwardRef, ReactNode } from "react"
import { Text as RNText, TextProps as RNTextProps, StyleProp, TextStyle } from "react-native"

import { isRTL, translate, TxKeyPath, type TranslationOptions } from "@/i18n"
import type { ThemedStyle, ThemedStyleArray } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { typography } from "@/theme/typography"

type Sizes = keyof typeof $sizeStyles
type Weights = keyof typeof typography.primary
type Presets = "default" | "bold" | "heading" | "subheading" | "formLabel" | "formHelper"

export interface TextProps extends RNTextProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TxKeyPath
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TranslationOptions
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<TextStyle>
  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * Text weight modifier.
   */
  weight?: Weights
  /**
   * Text size modifier.
   */
  size?: Sizes
  /**
   * Children components.
   */
  children?: ReactNode
}

/**
 * For your text displaying needs.
 * This component is a HOC over the built-in React Native one.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Text/}
 * @param {TextProps} props - The props for the `Text` component.
 * @returns {JSX.Element} The rendered `Text` component.
 */
export const Text = forwardRef(function Text(props: TextProps, ref: ForwardedRef<RNText>) {
  const { weight, size, tx, txOptions, text, children, style: $styleOverride, ...rest } = props
  const { themed, largeFontEnabled } = useAppTheme()

  const i18nText = tx ? translate(tx, txOptions) : undefined
  const content = i18nText || text || children

  const activePresets = largeFontEnabled ? $largePresets : $presets
  const activeSizeStyles = largeFontEnabled ? $largeSizeStyles : $sizeStyles

  const preset: Presets = props.preset ?? "default"
  const usesSecondaryTitleFont =
    preset === "heading" || preset === "subheading" || preset === "bold"
  const $styles: StyleProp<TextStyle> = [
    $rtlStyle,
    themed(activePresets[preset]),
    weight &&
      (usesSecondaryTitleFont ? $secondaryFontWeightStyles : $fontWeightStyles)[weight],
    size && activeSizeStyles[size],
    $styleOverride,
  ]

  return (
    <RNText {...rest} style={$styles} ref={ref}>
      {content}
    </RNText>
  )
})

const $sizeStyles = {
  xxl: { fontSize: 36, lineHeight: 44 } satisfies TextStyle,
  xl: { fontSize: 24, lineHeight: 34 } satisfies TextStyle,
  lg: { fontSize: 20, lineHeight: 32 } satisfies TextStyle,
  md: { fontSize: 18, lineHeight: 26 } satisfies TextStyle,
  sm: { fontSize: 16, lineHeight: 24 } satisfies TextStyle,
  xs: { fontSize: 14, lineHeight: 21 } satisfies TextStyle,
  xxs: { fontSize: 12, lineHeight: 18 } satisfies TextStyle,
}

const LARGE_FONT_MULTIPLIER = 1.22

function scaleSizes(sizes: typeof $sizeStyles): typeof $sizeStyles {
  return Object.fromEntries(
    Object.entries(sizes).map(([key, style]) => [
      key,
      {
        fontSize: Math.round(style.fontSize * LARGE_FONT_MULTIPLIER),
        lineHeight: Math.round(style.lineHeight * LARGE_FONT_MULTIPLIER),
      } satisfies TextStyle,
    ]),
  ) as typeof $sizeStyles
}

const $largeSizeStyles = scaleSizes($sizeStyles)

const $fontWeightStyles = Object.entries(typography.primary).reduce((acc, [weight, fontFamily]) => {
  return { ...acc, [weight]: { fontFamily } }
}, {}) as Record<Weights, TextStyle>

const $secondaryFontWeightStyles = Object.entries(typography.secondary).reduce(
  (acc, [weight, fontFamily]) => ({ ...acc, [weight]: { fontFamily } }),
  {},
) as Record<Weights, TextStyle>

function makeBaseStyle(sizes: typeof $sizeStyles): ThemedStyle<TextStyle> {
  return (theme) => ({
    ...sizes.sm,
    ...$fontWeightStyles.normal,
    color: theme.colors.text,
  })
}

function makePresets(sizes: typeof $sizeStyles): Record<Presets, ThemedStyleArray<TextStyle>> {
  const base = makeBaseStyle(sizes)
  return {
    default: [base],
    bold: [base, { ...$secondaryFontWeightStyles.bold }],
    heading: [base, { ...sizes.xxl, ...$secondaryFontWeightStyles.bold }],
    subheading: [base, { ...sizes.lg, ...$secondaryFontWeightStyles.medium }],
    formLabel: [base, { ...$fontWeightStyles.medium }],
    formHelper: [base, { ...sizes.sm, ...$fontWeightStyles.normal }],
  }
}

const $presets = makePresets($sizeStyles)
const $largePresets = makePresets($largeSizeStyles)
const $rtlStyle: TextStyle = isRTL ? { writingDirection: "rtl" } : {}
