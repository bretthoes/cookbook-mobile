import { GettingStartedGuide, useGuideAnchor } from "@/components/cookbooks/GettingStartedGuide"
import { Icon, type IconTypes } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import { useSubscriptionStore } from "@/stores/subscriptionStore"
import {
  draftItemHasContent,
  getEffectiveWeeklyImportCount,
  useUiStore,
  WEEKLY_IMPORT_LIMIT,
} from "@/stores/uiStore"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import {
  advanceGettingStartedTour,
  getGettingStartedTour,
  leaveGettingStartedTour,
  useGettingStartedTour,
} from "@/utils/gettingStartedTour"
import { useFocusEffect } from "expo-router/react-navigation"
import { router } from "expo-router"
import { useCallback, useEffect, useMemo, type RefObject } from "react"
import {
  BackHandler,
  Image,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const recipeLinkSites = require("@/assets/images/recipe-link-sites.png") as ImageSourcePropType

type RecipeAddOption = {
  titleTx: TxKeyPath
  descriptionTx: TxKeyPath
  icon?: IconTypes
  image?: ImageSourcePropType
  isPremium: boolean
  showDraftBadge?: boolean
  tourAnchor?: boolean
  action: () => void
}

export default function AddRecipeOptionsScreen() {
  const { themed } = useAppTheme()
  const setSelectedById = useUiStore((s) => s.setSelectedCookbookId)
  const drafts = useUiStore((s) => s.drafts)
  const pruneEmptyDrafts = useUiStore((s) => s.pruneEmptyDrafts)
  const weeklyImportCount = useUiStore((s) => s.weeklyImportCount)
  const weeklyImportWeekStart = useUiStore((s) => s.weeklyImportWeekStart)
  const isPro = useSubscriptionStore((s) => s.isPro)
  const tour = useGettingStartedTour()
  const manualAnchor = useGuideAnchor(tour?.step === "recipe" && tour.phase === "options")

  useFocusEffect(
    useCallback(() => {
      if (getGettingStartedTour()?.step === "recipe") advanceGettingStartedTour("options")
    }, []),
  )

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(logged-in)/(tabs)/cookbooks")
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack()
        return true
      })
      return () => sub.remove()
    }, [handleBack]),
  )

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddOptionsScreen:title",
    onLeftPress: handleBack,
  })

  const effectiveImportCount = getEffectiveWeeklyImportCount(
    weeklyImportCount,
    weeklyImportWeekStart,
  )
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
        titleTx: "recipeLinkImport:title",
        descriptionTx: "recipeLinkImport:summary",
        image: recipeLinkSites,
        isPremium: true,
        action: () => router.push("../recipe/select-url"),
      },
      {
        titleTx: "recipeAddOptionsScreen:optionFromPhoto",
        descriptionTx: "recipeAddOptionsScreen:optionFromPhotoDesc",
        icon: "camera" as IconTypes,
        isPremium: true,
        action: () => router.push("../recipe/add-photo"),
      },
      {
        titleTx: "recipeAddOptionsScreen:optionFromVoice",
        descriptionTx: "recipeAddOptionsScreen:optionFromVoiceDesc",
        icon: "menu" as IconTypes,
        isPremium: true,
        action: () => router.push("../recipe/add-voice"),
      },
      {
        titleTx: "recipeAddOptionsScreen:optionManual",
        descriptionTx: "recipeAddOptionsScreen:optionManualDesc",
        icon: "pen" as IconTypes,
        isPremium: false,
        tourAnchor: true,
        action: () => router.push("../recipe/add"),
      },
    ]

    if (!latestDraft) return baseOptions

    const draftOption: RecipeAddOption = {
      titleTx: "recipeAddOptionsScreen:continueDraft",
      descriptionTx: "recipeAddOptionsScreen:continueDraftDesc",
      icon: "progressPen" as IconTypes,
      isPremium: false,
      showDraftBadge: true,
      action: () => {
        setSelectedById(latestDraft.cookbookId)
        router.push({
          pathname: "../recipe/add",
          params: { continueDraft: "1", cookbookId: latestDraft.cookbookId },
        })
      },
    }

    return [...baseOptions, draftOption]
  }, [setSelectedById, latestDraft])

  const $themedScreenContainer = useMemo(() => themed($screenContainer), [themed])
  const $themedList = useMemo(() => themed($list), [themed])

  return (
    <Screen preset="scroll" contentContainerStyle={$themedScreenContainer}>
      <View style={$themedList}>
        {options.map((option) => (
          <OptionRow
            key={option.titleTx}
            titleTx={option.titleTx}
            descriptionTx={option.descriptionTx}
            icon={option.icon}
            image={option.image}
            isPremium={option.isPremium && !isPro}
            showDraftBadge={option.showDraftBadge}
            isDisabled={option.isPremium && isAtLimit}
            anchorRef={option.tourAnchor ? manualAnchor.ref : undefined}
            onAnchorLayout={option.tourAnchor ? manualAnchor.onLayout : undefined}
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
      {tour?.step === "recipe" && tour.phase === "options" ? (
        <GettingStartedGuide
          messageTx="gettingStarted:guideRecipeOptions"
          target={manualAnchor.target}
          onClose={leaveGettingStartedTour}
        />
      ) : null}
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

// #region OptionRow

interface OptionRowProps {
  titleTx: TxKeyPath
  descriptionTx: TxKeyPath
  icon?: IconTypes
  image?: ImageSourcePropType
  isPremium?: boolean
  showDraftBadge?: boolean
  isDisabled?: boolean
  anchorRef?: RefObject<View | null>
  onAnchorLayout?: () => void
  onPress: () => void
}

function OptionRow({
  titleTx,
  descriptionTx,
  icon,
  image,
  isPremium,
  showDraftBadge,
  isDisabled,
  anchorRef,
  onAnchorLayout,
  onPress,
}: OptionRowProps) {
  const { themed, theme } = useAppTheme()
  const $themedIconBox = useMemo(() => themed($iconBox), [themed])
  const $themedTitle = useMemo(() => themed($rowTitle), [themed])
  const $themedDescription = useMemo(() => themed($rowDescription), [themed])

  const rowStyle = useMemo(
    () => [themed($row), isPremium && themed($rowPremium), isDisabled && themed($rowDisabled)],
    [themed, isPremium, isDisabled],
  )

  const iconColor = isDisabled ? colors.palette.neutral400 : colors.tint

  return (
    <View ref={anchorRef} onLayout={onAnchorLayout} collapsable={false}>
      <TouchableOpacity
        style={rowStyle}
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
      >
        <View style={$themedIconBox}>
          {icon ? (
            <Icon icon={icon} size={44} color={iconColor} />
          ) : image ? (
            <Image
              source={image}
              style={[$rowImage, isDisabled && $rowImageDisabled]}
              resizeMode="contain"
            />
          ) : null}
        </View>
        <View style={$rowText}>
          <Text
            preset="bold"
            tx={titleTx}
            style={[$themedTitle, isDisabled && themed($disabledTitle)]}
          />
          <Text tx={descriptionTx} size="xs" style={$themedDescription} />
        </View>
        {showDraftBadge ? (
          <Icon icon="notification" size={20} color={colors.palette.angry500} />
        ) : isPremium ? (
          <View style={themed($premiumBadge)}>
            <Icon icon="lock" size={11} color={colors.palette.accent500} />
          </View>
        ) : (
          <Icon icon="caretRight" size={18} color={theme.colors.textDim} />
        )}
      </TouchableOpacity>
    </View>
  )
}

// #endregion

// #region Styles

const $screenContainer: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  paddingBottom: theme.spacing.xl,
})

const $list: ThemedStyle<ViewStyle> = (theme) => ({
  gap: theme.spacing.sm - 2,
})

const $row: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.md,
  paddingVertical: theme.spacing.md,
  paddingHorizontal: theme.spacing.md,
  minHeight: 120,
})

const $rowPremium: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 1.5,
  borderColor: theme.colors.separator,
})

const $rowDisabled: ThemedStyle<ViewStyle> = (theme) => ({
  opacity: 0.55,
  borderColor: theme.colors.border,
})

const $premiumBadge: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  borderRadius: 11,
  width: 22,
  height: 22,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.palette.accent400,
})

const $iconBox: ThemedStyle<ViewStyle> = (theme) => ({
  width: 84,
  height: 84,
  backgroundColor: theme.colors.background,
  borderRadius: 42,
  alignItems: "center",
  justifyContent: "center",
})

const $rowImage: ImageStyle = {
  width: 72,
  height: 72,
}

const $rowImageDisabled: ImageStyle = {
  opacity: 0.4,
}

const $rowText: ViewStyle = {
  flex: 1,
}

const $rowTitle: ThemedStyle<TextStyle> = () => ({
  fontSize: 17,
  lineHeight: 22,
})

const $rowDescription: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: 2,
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
