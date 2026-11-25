import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import {
  Image,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const tiktokLogo = require("@/assets/images/tiktok.png") as ImageSourcePropType
const instagramLogo = require("@/assets/images/instagram.png") as ImageSourcePropType
const pinterestLogo = require("@/assets/images/pinterest.png") as ImageSourcePropType
const youtubeShortsLogo = require("@/assets/images/youtube-shorts.png") as ImageSourcePropType

const SITES: { labelTx: TxKeyPath; image?: ImageSourcePropType }[] = [
  { labelTx: "recipeLinkImport:siteTiktok", image: tiktokLogo },
  { labelTx: "recipeLinkImport:siteInstagram", image: instagramLogo },
  { labelTx: "recipeLinkImport:sitePinterest", image: pinterestLogo },
  { labelTx: "recipeLinkImport:siteShorts", image: youtubeShortsLogo },
  { labelTx: "recipeLinkImport:siteWebsite" },
]

export function SupportedRecipeSites() {
  const { themed } = useAppTheme()

  return (
    <View style={themed($row)}>
      {SITES.map((site) => (
        <View key={site.labelTx} style={themed($item)}>
          <View style={themed($logoBox)}>
            {site.image ? (
              <Image source={site.image} style={themed($logo)} resizeMode="contain" />
            ) : (
              <Icon icon="web" size={28} color={colors.tint} />
            )}
          </View>
          <Text tx={site.labelTx} numberOfLines={2} style={themed($label)} />
        </View>
      ))}
    </View>
  )
}

const $row: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  gap: theme.spacing.xs,
})

const $item: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
  alignItems: "center",
})

const $logoBox: ThemedStyle<ViewStyle> = (theme) => ({
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing.xxs,
})

const $logo: ThemedStyle<ImageStyle> = () => ({
  width: 32,
  height: 32,
})

const $label: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 12,
  lineHeight: 15,
  textAlign: "center",
  color: theme.colors.text,
})
