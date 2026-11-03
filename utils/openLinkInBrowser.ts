import { translate } from "@/i18n/translate"
import * as Clipboard from "expo-clipboard"
import { Alert, Linking } from "react-native"

/**
 * Helper for opening a given URL in an external browser or app (e.g. mail client).
 * Mail links reject when the device has no mail app; show the address instead of throwing.
 */
export async function openLinkInBrowser(url: string) {
  try {
    // canOpenURL returns false for mailto on iOS unless the scheme is in LSApplicationQueriesSchemes
    if (!url.startsWith("mailto:")) {
      const canOpen = await Linking.canOpenURL(url)
      if (!canOpen) return
    }
    await Linking.openURL(url)
  } catch {
    if (!url.startsWith("mailto:")) return
    const email = emailFromMailto(url)
    if (!email) return
    Alert.alert(
      translate("common:mailUnavailableTitle"),
      translate("common:mailUnavailableMessage", { email }),
      [
        { text: translate("common:cancel"), style: "cancel" },
        {
          text: translate("common:copy"),
          onPress: () => {
            void Clipboard.setStringAsync(email)
          },
        },
      ],
    )
  }
}

function emailFromMailto(url: string): string | undefined {
  const address = url.slice("mailto:".length).split("?")[0]
  if (!address) return undefined
  try {
    return decodeURIComponent(address)
  } catch {
    return address
  }
}
