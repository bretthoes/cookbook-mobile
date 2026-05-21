import { Linking } from "react-native"

/**
 * Helper for opening a given URL in an external browser or app (e.g. mail client).
 */
export function openLinkInBrowser(url: string) {
  // canOpenURL returns false for mailto on iOS unless the scheme is in LSApplicationQueriesSchemes
  if (url.startsWith("mailto:")) {
    return Linking.openURL(url)
  }

  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url))
}
