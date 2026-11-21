import { CircularProgressScreen } from "@/components/CircularProgressScreen"
import { EmptyState } from "@/components/EmptyState"
import { FloatingActionButton } from "@/components/FloatingActionButton"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { CookbookCard } from "@/components/cookbooks/CookbookCard"
import { GettingStartedCard } from "@/components/cookbooks/GettingStartedCard"
import { GettingStartedGuide, useGuideAnchor } from "@/components/cookbooks/GettingStartedGuide"
import { useCookbooksList } from "@/hooks/queries/useCookbooksQuery"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { isRTL } from "@/i18n"
import { useAuthStore } from "@/stores/authStore"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import type { CookbookItem } from "@/types/cookbook"
import { getCookbooksForList } from "@/utils/cookbookList"
import {
  GETTING_STARTED_DEV_PREVIEW_KEY,
  accountHasCookbook,
  allGettingStartedStepsSeen,
  canStartGettingStartedGuide,
  cookbooksTabTourPhase,
  gettingStartedDismissedKey,
  gettingStartedStepKey,
  isCookbookStepDone,
  isGettingStartedStepUnlocked,
  pendingGettingStartedCount,
  shouldShowGettingStarted,
  type GettingStartedStep,
} from "@/utils/gettingStarted"
import {
  advanceGettingStartedTour,
  getGettingStartedTour,
  leaveGettingStartedTour,
  startGettingStartedTour,
  useGettingStartedTour,
} from "@/utils/gettingStartedTour"
import { storage } from "@/utils/storage"
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useMMKVBoolean } from "react-native-mmkv"
import { ActivityIndicator, FlatList, ImageStyle, Platform, View, ViewStyle } from "react-native"
import { useTranslation } from "react-i18next"

const FAB_SIZE = 56
const isIos = Platform.OS === "ios"

export default function CookbooksScreen(_props: void) {
  const router = useRouter()
  const { themeContext } = useAppTheme()
  const { t } = useTranslation()
  const isDark = themeContext === "dark"
  const tabBarHeight = useBottomTabBarHeight()

  const isFocused = useIsFocused()
  const userId = useAuthStore((s) => s.userId)
  const [dismissedGettingStarted = false, setDismissedGettingStarted] = useMMKVBoolean(
    gettingStartedDismissedKey(userId),
    storage,
  )
  const [devPreview = false, setDevPreview] = useMMKVBoolean(
    GETTING_STARTED_DEV_PREVIEW_KEY,
    storage,
  )
  const [seenCookbook = false, setSeenCookbook] = useMMKVBoolean(
    gettingStartedStepKey(userId, "cookbook"),
    storage,
  )
  const [seenRecipe = false] = useMMKVBoolean(gettingStartedStepKey(userId, "recipe"), storage)
  const [seenInvite = false] = useMMKVBoolean(gettingStartedStepKey(userId, "invite"), storage)
  const previewGettingStarted = __DEV__ && devPreview

  const { cookbooks, isListPending, listHasNextPage, isLoadingMore, refetch, fetchNextPage } =
    useCookbooksList()
  const hasCookbook = !isListPending && accountHasCookbook(cookbooks)
  const gettingStartedDone = useMemo(
    () => ({
      cookbook: isCookbookStepDone(seenCookbook, hasCookbook),
      recipe: seenRecipe,
      invite: seenInvite,
    }),
    [hasCookbook, seenCookbook, seenInvite, seenRecipe],
  )
  const unlockedSteps = useMemo(
    () => ({
      cookbook: true,
      recipe: isGettingStartedStepUnlocked("recipe", gettingStartedDone, hasCookbook),
      invite: isGettingStartedStepUnlocked("invite", gettingStartedDone, hasCookbook),
    }),
    [gettingStartedDone, hasCookbook],
  )
  const pendingSteps = pendingGettingStartedCount(gettingStartedDone, hasCookbook)
  const allStepsSeen = allGettingStartedStepsSeen(gettingStartedDone)

  useEffect(() => {
    if (hasCookbook && !seenCookbook) setSeenCookbook(true)
  }, [hasCookbook, seenCookbook, setSeenCookbook])

  const tour = useGettingStartedTour()
  const showFabGuide = isFocused && tour?.step === "cookbook" && tour.phase === "fab"
  const showChooseGuide = isFocused && tour?.phase === "choose"
  const fabAnchor = useGuideAnchor(showFabGuide)
  const firstCookbookAnchor = useGuideAnchor(showChooseGuide)

  useFocusEffect(
    useCallback(() => {
      const current = getGettingStartedTour()
      if (current) advanceGettingStartedTour(cookbooksTabTourPhase(current.step))
    }, []),
  )

  const cookbooksForList = useMemo(() => getCookbooksForList(cookbooks), [cookbooks])
  const [leavingGettingStarted, setLeavingGettingStarted] = useState(false)
  const tutorialOpen =
    !isListPending &&
    shouldShowGettingStarted(dismissedGettingStarted, allStepsSeen, previewGettingStarted)
  if (
    isFocused &&
    !isListPending &&
    allStepsSeen &&
    !dismissedGettingStarted &&
    !leavingGettingStarted
  ) {
    setLeavingGettingStarted(true)
  }
  const showGettingStarted = tutorialOpen || leavingGettingStarted

  const dismissGettingStarted = useCallback(() => {
    setDismissedGettingStarted(true)
    setDevPreview(false)
    setLeavingGettingStarted(false)
  }, [setDevPreview, setDismissedGettingStarted])

  const openCreateCookbook = useCallback(() => {
    router.push("/(logged-in)/cookbook/add")
  }, [router])

  const openGuide = useCallback(
    (step: GettingStartedStep) => {
      if (!unlockedSteps[step] || !canStartGettingStartedGuide(step, hasCookbook)) return
      startGettingStartedTour(step)
    },
    [hasCookbook, unlockedSteps],
  )

  const { refreshing, onRefresh } = useManualRefresh(useCallback(() => refetch(), [refetch]))

  const handleLoadMore = useCallback(() => {
    if (!listHasNextPage || isLoadingMore) return
    void fetchNextPage()
  }, [listHasNextPage, isLoadingMore, fetchNextPage])

  const renderItem = useCallback(
    ({ item, index }: { item: CookbookItem; index: number }) =>
      index === 0 ? (
        <View
          ref={firstCookbookAnchor.ref}
          onLayout={firstCookbookAnchor.onLayout}
          collapsable={false}
        >
          <CookbookCard cookbook={item} isDark={isDark} />
        </View>
      ) : (
        <CookbookCard cookbook={item} isDark={isDark} />
      ),
    [firstCookbookAnchor.onLayout, firstCookbookAnchor.ref, isDark],
  )

  // iOS: the floating tab bar overlays content, so clear it. Android: the bar reserves its own space.
  const fabBottom = isIos ? tabBarHeight : spacing.lg
  const listContentStyle = useMemo<ViewStyle>(
    () => ({
      paddingHorizontal: spacing.lg,
      paddingBottom: fabBottom + FAB_SIZE + spacing.lg,
    }),
    [fabBottom],
  )

  if (isListPending) {
    return <CircularProgressScreen accessibilityLabel={t("cookbooksScreen:loadingCookbooks")} />
  }

  return (
    <View style={$root}>
      <Screen
        preset="fixed"
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContentContainer}
      >
        <FlatList
          contentContainerStyle={listContentStyle}
          data={cookbooksForList}
          keyExtractor={(item) => String(item.id)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            showGettingStarted ? null : (
              <EmptyState
                preset="generic"
                style={$emptyState}
                headingTx="gettingStarted:emptyTitle"
                contentTx="cookbooksScreen:cookbookListScreen.noCookbooksEmptyState"
                buttonTx="gettingStarted:createCookbook"
                buttonOnPress={openCreateCookbook}
                imageStyle={$emptyStateImage}
                ImageProps={{ resizeMode: "contain" }}
              />
            )
          }
          ListHeaderComponent={
            <View style={[$heading, showGettingStarted && $headingWithTutorial]}>
              <Text preset="heading" tx="cookbooksScreen:title" />
              {showGettingStarted ? (
                <GettingStartedCard
                  unlocked={unlockedSteps}
                  done={gettingStartedDone}
                  pendingCount={pendingSteps}
                  exiting={leavingGettingStarted}
                  onShowGuide={openGuide}
                  onDismiss={dismissGettingStarted}
                />
              ) : null}
            </View>
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={$footerLoader}>
                <ActivityIndicator />
              </View>
            ) : null
          }
          renderItem={renderItem}
        />
      </Screen>
      <FloatingActionButton
        onPress={openCreateCookbook}
        accessibilityLabel={t("cookbooksScreen:newCookbookA11y")}
        bottomOffset={fabBottom}
        ignoreBottomInset
        anchorRef={fabAnchor.ref}
        onAnchorLayout={fabAnchor.onLayout}
      />
      {showFabGuide ? (
        <GettingStartedGuide
          messageTx="gettingStarted:guideCookbookFab"
          target={fabAnchor.target}
          placeAbove
          onClose={leaveGettingStartedTour}
        />
      ) : null}
      {showChooseGuide ? (
        <GettingStartedGuide
          messageTx={
            tour?.step === "invite"
              ? "gettingStarted:guideInviteChoose"
              : "gettingStarted:guideRecipeChoose"
          }
          target={firstCookbookAnchor.target}
          onClose={leaveGettingStartedTour}
        />
      ) : null}
    </View>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $heading: ViewStyle = {
  marginBottom: spacing.md,
  paddingTop: spacing.lg + spacing.xl,
}

const $headingWithTutorial: ViewStyle = {
  marginBottom: 0,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $footerLoader: ViewStyle = {
  paddingVertical: spacing.md,
}
