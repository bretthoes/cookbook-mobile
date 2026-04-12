const palette = {
  neutral100: "#FFFFFF",
  neutral200: "#FAF6F0",
  neutral300: "#EFE6D9",
  neutral400: "#D4C5B3",
  neutral500: "#9E8F7F",
  neutral600: "#6B5E50",
  neutral700: "#4A413A",
  neutral800: "#2D2925",
  neutral900: "#1A1715",

  primary100: "#F4EEED",
  primary200: "#E9D5D2",
  primary300: "#DBB8B4",
  primary400: "#CC9E99",
  primary500: "#BA7F79",
  primary600: "#9D6A65",

  secondary100: "#DCDDE9",
  secondary200: "#BCC0D6",
  secondary300: "#9196B9",
  secondary400: "#626894",
  secondary500: "#41476E",

  accent100: "#F7F0EF",
  accent200: "#EFDAD8",
  accent300: "#E4BEBA",
  accent400: "#D4A29C",
  accent500: "#C48A84",

  angry100: "#F2D6CD",
  angry500: "#C03403",

  overlay20: "rgba(25, 16, 21, 0.2)",
  overlay50: "rgba(25, 16, 21, 0.5)",
} as const

export const colors = {
  /**
   * The palette is available to use, but prefer using the name.
   * This is only included for rare, one-off cases. Try to use
   * semantic names as much as possible.
   */
  palette,
  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",
  /**
   * The default text color in many components.
   */
  text: palette.neutral800,
  /**
   * Secondary text information.
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background.
   */
  background: palette.neutral200,
  /**
   * Secondary background screen color.
   */
  backgroundDim: palette.neutral100,
  /**
   * The default border color.
   */
  border: palette.neutral400,
  /**
   * Secondary border color.
   */
  borderDim: palette.neutral500,
  /*
   *
   */
  icon: palette.neutral700,
  /**
   * The main tinting color.
   */
  tint: palette.primary500,
  /**
   * The inactive tinting color.
   */
  tintInactive: palette.neutral300,
  /**
   * A subtle color used for lines.
   */
  separator: palette.neutral300,
  /**
   * Error messages.
   */
  error: palette.angry500,
  /**
   * Error Background.
   */
  errorBackground: palette.angry100,
} as const
