import { Icon, type IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAddRecipeFromCamera } from "@/hooks/useAddRecipeFromCamera"
import { useStores } from "@/models/helpers/useStores"
import { getCurrentWeekKey, WEEKLY_IMPORT_LIMIT } from "@/models/Recipe/RecipeStore"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Alert,
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
  const { cookbookStore, recipeStore } = useStores()
  const addRecipeFromCamera = useAddRecipeFromCamera()

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const currentWeek = getCurrentWeekKey()
  const effectiveImportCount =
    recipeStore.weeklyImportWeekStart === currentWeek ? recipeStore.weeklyImportCount : 0
  const isAtLimit = effectiveImportCount >= WEEKLY_IMPORT_LIMIT
  const progressRatio = Math.min(effectiveImportCount / WEEKLY_IMPORT_LIMIT, 1)

  const handlePremiumPress = (action: () => void) => {
    if (isAtLimit) {
      Alert.alert(
        t("recipeAddOptionsScreen:weeklyLimitReachedTitle"),
        t("recipeAddOptionsScreen:weeklyLimitReachedMessage", { limit: WEEKLY_IMPORT_LIMIT }),
      )
      return
    }
    action()
  }

  const options = useMemo(
    () => [
      {
        title: t("recipeAddOptionsScreen:optionFromTiktok"),
        description: t("recipeAddOptionsScreen:optionFromTiktokDesc"),
        image: tiktokLogo as ImageSourcePropType,
        isPremium: true,
        action: () =>
          router.replace({
            pathname: "../recipe/add-social-import",
            params: { platform: "tiktok" },
          }),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromInstagram"),
        description: t("recipeAddOptionsScreen:optionFromInstagramDesc"),
        image: instagramLogo as ImageSourcePropType,
        isPremium: true,
        action: () =>
          router.replace({
            pathname: "../recipe/add-social-import",
            params: { platform: "instagram" },
          }),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromPinterest"),
        description: t("recipeAddOptionsScreen:optionFromPinterestDesc"),
        image: pinterestLogo as ImageSourcePropType,
        isPremium: true,
        action: () =>
          router.replace({
            pathname: "../recipe/add-social-import",
            params: { platform: "pinterest" },
          }),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromUrl"),
        description: t("recipeAddOptionsScreen:optionFromUrlDesc"),
        icon: "web" as IconTypes,
        isPremium: true,
        action: () => router.replace("../recipe/select-url"),
      },
      {
        title: t("recipeAddOptionsScreen:optionFromPhoto"),
        description: t("recipeAddOptionsScreen:optionFromPhotoDesc"),
        icon: "camera" as IconTypes,
        isPremium: true,
        action: () => {
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
        isPremium: true,
        action: () => router.replace("../recipe/add-voice"),
      },
      {
        title: t("recipeAddOptionsScreen:optionManual"),
        description: t("recipeAddOptionsScreen:optionManualDesc"),
        icon: "pen" as IconTypes,
        isPremium: false,
        action: () => router.replace("../recipe/add"),
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
          <OptionTile
            key={index}
            title={option.title}
            icon={option.icon}
            image={option.image}
            isPremium={option.isPremium}
            isDisabled={option.isPremium && isAtLimit}
            onPress={() => {
              if (option.isPremium) {
                handlePremiumPress(option.action)
              } else {
                option.action()
              }
            }}
          />
        ))}
      </View>
      <WeeklyUsageBanner
        used={effectiveImportCount}
        limit={WEEKLY_IMPORT_LIMIT}
        progressRatio={progressRatio}
        isAtLimit={isAtLimit}
      />
    </Screen>
  )
})

// #region WeeklyUsageBanner

interface WeeklyUsageBannerProps {
  used: number
  limit: number
  progressRatio: number
  isAtLimit: boolean
}

function WeeklyUsageBanner({ used, limit, progressRatio, isAtLimit }: WeeklyUsageBannerProps) {
  const { themed } = useAppTheme()

  const fillColor = isAtLimit ? colors.palette.angry500 : colors.palette.accent500

  return (
    <View style={themed($bannerContainer)}>
      <View style={themed($progressTrack)}>
        <View style={[themed($progressFill), { width: `${progressRatio * 100}%`, backgroundColor: fillColor }]} />
      </View>
      <Text
        tx="recipeAddOptionsScreen:weeklyUsageLabel"
        txOptions={{ used, limit }}
        style={themed($usageText)}
      />
      <Text
        tx="recipeAddOptionsScreen:weeklyLimitResetInfo"
        style={themed($resetInfoText)}
      />
    </View>
  )
}

// #endregion

// #region OptionTile

interface OptionTileProps {
  title: string
  description?: string
  icon?: IconTypes
  image?: ImageSourcePropType
  isPremium?: boolean
  isDisabled?: boolean
  onPress: () => void
}

function OptionTile({ title, icon, image, isPremium, isDisabled, onPress }: OptionTileProps) {
  const { themed } = useAppTheme()
  const $themedTileOuter = useMemo(() => themed($tileOuter), [themed])
  const $themedIconBox = useMemo(() => themed($iconBox), [themed])
  const $themedTitle = useMemo(() => themed($tileTitle), [themed])

  const tileInnerStyle = useMemo(
    () => [
      themed($tileInner),
      isPremium && themed($tileInnerPremium),
      isDisabled && themed($tileInnerDisabled),
    ],
    [themed, isPremium, isDisabled],
  )

  const iconColor = isDisabled ? colors.palette.neutral400 : colors.tint

  return (
    <View style={$themedTileOuter}>
      <TouchableOpacity style={tileInnerStyle} onPress={onPress} activeOpacity={0.75}>
        {isPremium && (
          <View style={themed($premiumBadge)}>
            <Icon icon="lock" size={11} color={colors.palette.accent500} />
          </View>
        )}
        <View style={$themedIconBox}>
          {icon ? (
            <Icon icon={icon} size={44} color={iconColor} />
          ) : image ? (
            <Image
              source={image}
              style={{ width: 62, height: 62, opacity: isDisabled ? 0.4 : 1 }}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text preset="subheading" text={title} style={[$themedTitle, isDisabled && themed($disabledTitle)]} />
      </TouchableOpacity>
    </View>
  )
}

// #endregion

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

const $tileInnerPremium: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 1.5,
  borderColor: theme.colors.separator,
})

const $tileInnerDisabled: ThemedStyle<ViewStyle> = (theme) => ({
  opacity: 0.55,
  borderColor: theme.colors.border,
})

const $premiumBadge: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: theme.spacing.xs,
  right: theme.spacing.xs,
  backgroundColor: theme.colors.background,
  borderRadius: 10,
  width: 22,
  height: 22,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.palette.accent400,
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

const $disabledTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $bannerContainer: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
  paddingHorizontal: theme.spacing.xs,
  gap: theme.spacing.xs,
})

const $progressTrack: ThemedStyle<ViewStyle> = (theme) => ({
  height: 8,
  backgroundColor: theme.colors.separator,
  borderRadius: 4,
  overflow: "hidden",
})

const $progressFill: ThemedStyle<ViewStyle> = () => ({
  height: "100%",
  borderRadius: 4,
})

const $usageText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  color: theme.colors.textDim,
  textAlign: "center",
})

const $resetInfoText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 11,
  color: theme.colors.textDim,
  textAlign: "center",
  opacity: 0.7,
})

// #endregion
