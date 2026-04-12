// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from "react-native"
import {
  PlaypenSans_300Light as playpenSansLight,
  PlaypenSans_400Regular as playpenSansRegular,
  PlaypenSans_500Medium as playpenSansMedium,
  PlaypenSans_600SemiBold as playpenSansSemiBold,
  PlaypenSans_700Bold as playpenSansBold,
} from "@expo-google-fonts/playpen-sans"
import {
  SpaceGrotesk_300Light as spaceGroteskLight,
  SpaceGrotesk_400Regular as spaceGroteskRegular,
  SpaceGrotesk_500Medium as spaceGroteskMedium,
  SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
  SpaceGrotesk_700Bold as spaceGroteskBold,
} from "@expo-google-fonts/space-grotesk"

/** Pass to `useFonts` from `expo-font` — loads Playpen Sans + Space Grotesk. */
export const customFontsToLoad = {
  playpenSansLight,
  playpenSansRegular,
  playpenSansMedium,
  playpenSansSemiBold,
  playpenSansBold,
  spaceGroteskLight,
  spaceGroteskRegular,
  spaceGroteskMedium,
  spaceGroteskSemiBold,
  spaceGroteskBold,
}

const fonts = {
  playpenSans: {
    light: "playpenSansLight",
    normal: "playpenSansRegular",
    medium: "playpenSansMedium",
    semiBold: "playpenSansSemiBold",
    bold: "playpenSansBold",
  },
  spaceGrotesk: {
    light: "spaceGroteskLight",
    normal: "spaceGroteskRegular",
    medium: "spaceGroteskMedium",
    semiBold: "spaceGroteskSemiBold",
    bold: "spaceGroteskBold",
  },
  helveticaNeue: {
    // iOS only font.
    thin: "HelveticaNeue-Thin",
    light: "HelveticaNeue-Light",
    normal: "Helvetica Neue",
    medium: "HelveticaNeue-Medium",
  },
  courier: {
    // iOS only font.
    normal: "Courier",
  },
  sansSerif: {
    // Android only font.
    thin: "sans-serif-thin",
    light: "sans-serif-light",
    normal: "sans-serif",
    medium: "sans-serif-medium",
  },
  monospace: {
    // Android only font.
    normal: "monospace",
  },
}

export const typography = {
  /**
   * The fonts are available to use, but prefer using the semantic name.
   */
  fonts,
  /**
   * The primary font. Used in most places.
   */
  primary: fonts.playpenSans,
  /**
   * Secondary font (Space Grotesk). Use e.g. `fontFamily: theme.typography.secondary.medium`
   * in a `ThemedStyle` for headings or emphasis.
   */
  secondary: fonts.spaceGrotesk,
  /**
   * Lets get fancy with a monospace font!
   */
  code: Platform.select({ ios: fonts.courier, android: fonts.monospace }),
}
