import { Icon, type IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAddRecipeFromCamera } from "@/hooks/useAddRecipeFromCamera"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Image,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const tiktokLogo = require("@/assets/images/tiktok.png")
const instagramLogo = require("@/assets/images/instagram.png")
const pinterestLogo = require("@/assets/images/pinterest.png")

export default observer(function AddRecipeOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const { cookbookStore } = useStores()
  const addRecipeFromCamera = useAddRecipeFromCamera()

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const options = useMemo(
    () => [
      {
        title: t("recipeAddOptionsScreen:optionFromTiktok"),
        description: t("recipeAddOptionsScreen:optionFromTiktokDesc"),
        image: tiktokLogo as ImageSourcePropType,
        onPress: () =>
          router.replace({
            pathname: "../recipe/add-social-import",
            params: { platform: "tiktok" },
          }),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromInstagram"),
        description: t("recipeAddOptionsScreen:optionFromInstagramDesc"),
        image: instagramLogo as ImageSourcePropType,
        onPress: () =>
          router.replace({
            pathname: "../recipe/add-social-import",
            params: { platform: "instagram" },
          }),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromPinterest"),
        description: t("recipeAddOptionsScreen:optionFromPinterestDesc"),
        image: pinterestLogo as ImageSourcePropType,
        onPress: () =>
          router.replace({
            pathname: "../recipe/add-social-import",
            params: { platform: "pinterest" },
          }),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromUrl"),
        description: t("recipeAddOptionsScreen:optionFromUrlDesc"),
        icon: "web" as IconTypes,
        onPress: () => router.replace("../recipe/select-url"),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromPhoto"),
        description: t("recipeAddOptionsScreen:optionFromPhotoDesc"),
        icon: "camera" as IconTypes,
        onPress: () => {
          if (cookbookStore.selected) {
            addRecipeFromCamera()
          } else {
            router.replace({
              pathname: "../select-cookbook",
              params: {
                nextRoute: "/(logged-in)/(tabs)/recipe/add",
                action: t("selectCookbookScreen:actionForAddFromCamera"),
                onSelect: "handleAddRecipeFromCamera",
              },
            })
          }
        },
      },
      {
        title: t("recipeAddOptionsScreen:optionFromVoice"),
        description: t("recipeAddOptionsScreen:optionFromVoiceDesc"),
        icon: "menu" as IconTypes,
        onPress: () => router.replace("../recipe/add-voice"),
      },
      {
        title: t("recipeAddOptionsScreen:optionManual"),
        description: t("recipeAddOptionsScreen:optionManualDesc"),
        icon: "pen" as IconTypes,
        onPress: () => router.replace("../recipe/add"),
      },
    ],
    [t, cookbookStore.selected, addRecipeFromCamera],
  )

  const $themedScreenContainer = useMemo(() => themed($screenContainer), [themed])
  const $themedGrid = useMemo(() => themed($grid), [themed])

  return (
    <Screen preset="scroll" contentContainerStyle={$themedScreenContainer}>
      <View style={$themedGrid}>
        {options.map((option, index) => (
          <OptionTile key={index} {...option} />
        ))}
      </View>
    </Screen>
  )
})

interface OptionTileProps {
  title: string
  description?: string
  icon?: IconTypes
  image?: ImageSourcePropType
  onPress: () => void
}

function OptionTile({ title, icon, image, onPress }: OptionTileProps) {
  const { themed } = useAppTheme()
  const $themedTileOuter = useMemo(() => themed($tileOuter), [themed])
  const $themedTileInner = useMemo(() => themed($tileInner), [themed])
  const $themedIconBox = useMemo(() => themed($iconBox), [themed])
  const $themedTitle = useMemo(() => themed($tileTitle), [themed])

  return (
    <View style={$themedTileOuter}>
      <TouchableOpacity style={$themedTileInner} onPress={onPress} activeOpacity={0.75}>
        <View style={$themedIconBox}>
          {icon ? (
            <Icon icon={icon} size={44} color={colors.tint} />
          ) : image ? (
            <Image source={image} style={{ width: 62, height: 62 }} resizeMode="contain" />
          ) : null}
        </View>
        <Text preset="subheading" text={title} style={$themedTitle} />
      </TouchableOpacity>
    </View>
  )
}

// #region Styles

const $screenContainer: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.sm,
  paddingHorizontal: theme.spacing.sm,
  paddingBottom: theme.spacing.xl,
})

const $grid: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  flexWrap: "wrap",
})

const $tileOuter: ThemedStyle<ViewStyle> = (theme) => ({
  width: "50%",
  padding: theme.spacing.xs,
})

const $tileInner: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.md,
  paddingHorizontal: theme.spacing.xs,
  paddingVertical: theme.spacing.sm,
  alignItems: "center",
  minHeight: 148,
  justifyContent: "center",
})

const $iconBox: ThemedStyle<ViewStyle> = (theme) => ({
  width: 76,
  height: 76,
  backgroundColor: theme.colors.background,
  borderRadius: 38,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing.sm,
})

const $tileTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 15,
  textAlign: "center",
})

// #endregion
