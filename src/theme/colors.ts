const palette = {
  // Neutral colors - warm paper-like tones
  neutral100: "#FFFFFF",
  neutral200: "#FAF6F0", // Warm off-white, paper-like
  neutral300: "#EFE6D9", // Warm cream
  neutral400: "#D4C5B3", // Warm taupe
  neutral500: "#9E8F7F", // Warm gray
  neutral600: "#6B5E50", // Deep warm brown
  neutral700: "#4A413A", // Rich brown
  neutral800: "#2D2925", // Deep brown-black
  neutral900: "#1A1715", // Soft black

  // Primary colors - warm terracotta/clay tones
  primary100: "#FFF1EC",
  primary200: "#FFD6C7",
  primary300: "#FBA78D",
  primary400: "#F87F5F",
  primary500: "#E85D3A", // Main brand color - warm terracotta
  primary600: "#C13D1E",

  // Secondary colors - sage/herb tones
  secondary100: "#F0F4E8",
  secondary200: "#D8E0CB",
  secondary300: "#B3BFA3",
  secondary400: "#8B9A78",
  secondary500: "#5F6B4F",

  // Accent colors - butter/honey tones
  accent100: "#FFF8E7",
  accent200: "#FFE9B2",
  accent300: "#FFD87F",
  accent400: "#FFC847",
  accent500: "#FFB819",

  // Error states
  angry100: "#FFF0F0",
  angry500: "#D13F3F",

  overlay20: "rgba(45, 41, 37, 0.2)",
  overlay50: "rgba(45, 41, 37, 0.5)",
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
   * The default border color.
   */
  border: palette.neutral300,
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
