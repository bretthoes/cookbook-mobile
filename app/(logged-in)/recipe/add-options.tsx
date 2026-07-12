import { Icon, type IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useSelectedCookbook } from "@/hooks/useSelectedCookbook"
import { useSubscriptionStore } from "@/stores/subscriptionStore"
import {
  draftItemHasContent,
  getCurrentWeekKey,
  useUiStore,
  WEEKLY_IMPORT_LIMIT,
} from "@/stores/uiStore"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  Image,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const tiktokLogo = require("@/assets/images/tiktok.png")
const instagramLogo = require("@/assets/images/instagram.png")
const pinterestLogo = require("@/assets/images/pinterest.png")

type RecipeAddOption = {
  title: string
  description?: string
  icon?: IconTypes
  image?: ImageSourcePropType
  isPremium: boolean
  showDraftBadge?: boolean
  action: () => void
}

export default function AddRecipeOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const { selected } = useSelectedCookbook()
  const setSelectedById = useUiStore((s) => s.setSelectedCookbookId)
  const drafts = useUiStore((s) => s.drafts)
  const pruneEmptyDrafts = useUiStore((s) => s.pruneEmptyDrafts)
  const weeklyImportCount = useUiStore((s) => s.weeklyImportCount)
  const weeklyImportWeekStart = useUiStore((s) => s.weeklyImportWeekStart)
  const isPro = useSubscriptionStore((s) => s.isPro)

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const currentWeek = getCurrentWeekKey()
  const effectiveImportCount = weeklyImportWeekStart === currentWeek ? weeklyImportCount : 0
  const isAtLimit = !isPro && effectiveImportCount >= WEEKLY_IMPORT_LIMIT
  const progressRatio = Math.min(effectiveImportCount / WEEKLY_IMPORT_LIMIT, 1)

  useEffect(() => {
    pruneEmptyDrafts()
  }, [pruneEmptyDrafts])

  const handlePremiumPress = (action: () => void) => {
    if (isAtLimit) {
      router.push("../recipe/paywall")
      return
    }
    action()
  }

  // Most recently saved draft with real in-progress content — surfaces "Continue Draft"
  const latestDraft = useMemo(() => {
    const pendingDrafts = drafts.filter((draft) => draftItemHasContent(draft))
    if (pendingDrafts.length === 0) return null
    return pendingDrafts.reduce((latest, d) => {
      const latestTime = new Date(latest.savedAt as string | Date).getTime()
      const dTime = new Date(d.savedAt as string | Date).getTime()
      return dTime > latestTime ? d : latest
    })
  }, [drafts])

  const options = useMemo(() => {
    const baseOptions: RecipeAddOption[] = [
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
          if (selected) {
            router.replace("../recipe/add-photo")
          } else {
            router.replace({
              pathname: "../select-cookbook",
              params: {
                nextRoute: "/(logged-in)/recipe/add-photo",
                action: t("selectCookbookScreen:actionForAddFromCamera"),
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
    ]

    if (!latestDraft) return baseOptions

    const draftOption: RecipeAddOption = {
      title: t("recipeAddOptionsScreen:continueDraft"),
      description: t("recipeAddOptionsScreen:continueDraftDesc"),
      icon: "progressPen" as IconTypes,
      isPremium: false,
      showDraftBadge: true,
      action: () => {
        setSelectedById(latestDraft.cookbookId)
        router.replace({
          pathname: "../recipe/add",
          params: { continueDraft: "1", cookbookId: latestDraft.cookbookId },
        })
      },
    }

    return [...baseOptions, draftOption]
  }, [t, selected, setSelectedById, latestDraft])

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
            isPremium={option.isPremium && !isPro}
            showDraftBadge={option.showDraftBadge}
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
      {isPro ? (
        <ProBanner />
      ) : (
        <WeeklyUsageBanner
          used={effectiveImportCount}
          limit={WEEKLY_IMPORT_LIMIT}
          progressRatio={progressRatio}
          isAtLimit={isAtLimit}
        />
      )}
    </Screen>
  )
}

// #region ProBanner

function ProBanner() {
  const { themed } = useAppTheme()
  return (
    <View style={themed($proBannerContainer)}>
      <Text tx="recipeAddOptionsScreen:proUnlimitedLabel" style={themed($proUnlimitedText)} />
    </View>
  )
}

// #endregion

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
        <View
          style={[
            themed($progressFill),
            { width: `${progressRatio * 100}%`, backgroundColor: fillColor },
          ]}
        />
      </View>
      <Text
        tx="recipeAddOptionsScreen:weeklyUsageLabel"
        txOptions={{ used, limit }}
        style={themed($usageText)}
      />
      <Text tx="recipeAddOptionsScreen:weeklyLimitResetInfo" style={themed($resetInfoText)} />
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
  showDraftBadge?: boolean
  isDisabled?: boolean
  onPress: () => void
}

function OptionTile({
  title,
  icon,
  image,
  isPremium,
  showDraftBadge,
  isDisabled,
  onPress,
}: OptionTileProps) {
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
        {showDraftBadge && (
          <Icon
            icon="notification"
            size={22}
            color={colors.palette.angry500}
            containerStyle={themed($draftBadge)}
          />
        )}
        <View style={$themedIconBox}>
          {icon ? (
            <Icon icon={icon} size={40} color={iconColor} />
          ) : image ? (
            <Image
              source={image}
              style={[themed($tileImage), isDisabled && themed($tileImageDisabled)]}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <Text
          preset="subheading"
          text={title}
          numberOfLines={2}
          style={[$themedTitle, isDisabled && themed($disabledTitle)]}
        />
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
  padding: theme.spacing.xxs,
})

const $tileInner: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.md,
  paddingHorizontal: theme.spacing.xs,
  paddingVertical: theme.spacing.xs,
  alignItems: "center",
  height: 142,
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

const $draftBadge: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: theme.spacing.xs,
  right: theme.spacing.xs,
})

const $iconBox: ThemedStyle<ViewStyle> = (theme) => ({
  width: 68,
  height: 68,
  backgroundColor: theme.colors.background,
  borderRadius: 34,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing.xs,
})

const $tileImage: ThemedStyle<ImageStyle> = () => ({
  width: 56,
  height: 56,
})

const $tileImageDisabled: ThemedStyle<ImageStyle> = () => ({
  opacity: 0.4,
})

const $tileTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 15,
  lineHeight: 18,
  minHeight: 36,
  textAlign: "center",
})

const $disabledTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $proBannerContainer: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.md,
  paddingHorizontal: theme.spacing.xs,
  alignItems: "center",
})

const $proUnlimitedText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 13,
  color: colors.palette.accent500,
  textAlign: "center",
  fontWeight: "600",
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
