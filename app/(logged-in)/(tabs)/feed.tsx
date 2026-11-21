import { EmptyState } from "@/components/EmptyState"
import { FeedPostItem } from "@/components/activity/FeedPostItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useNotificationsList } from "@/hooks/queries/useNotificationsQuery"
import { markFeedSeen } from "@/hooks/useFeedUnseen"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { useAuthStore } from "@/stores/authStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import type { NotificationItem } from "@/types/notification"
import { groupActivityFeed, isUnseenActivity, type ActivityFeedSection } from "@/utils/activityFeed"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Platform, SectionList, TextStyle, View, ViewStyle } from "react-native"

export default function FeedScreen() {
  const { themed } = useAppTheme()
  const userId = useAuthStore((s) => s.userId)
  const { notifications, isListPending, listHasNextPage, isLoadingMore, refetch, fetchNextPage } =
    useNotificationsList()
  // Frozen for this visit so "New" stays on what was new when the tab opened.
  const [seenBeforeVisit, setSeenBeforeVisit] = useState<string | undefined>()
  const [hasMarked, setHasMarked] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setSeenBeforeVisit(markFeedSeen(userId))
      setHasMarked(true)
      void refetch()
      return () => {
        markFeedSeen(userId)
      }
    }, [refetch, userId]),
  )

  const { refreshing, onRefresh } = useManualRefresh(useCallback(() => refetch(), [refetch]))

  const handleLoadMore = useCallback(() => {
    if (!listHasNextPage || isLoadingMore) return
    void fetchNextPage()
  }, [listHasNextPage, isLoadingMore, fetchNextPage])

  const sections = useMemo(() => groupActivityFeed(notifications, new Date()), [notifications])

  const $themedHeading = useMemo(() => themed($heading), [themed])
  const $themedSubtitle = useMemo(() => themed($subtitle), [themed])
  const $themedSectionTitle = useMemo(() => themed($sectionTitle), [themed])
  const $themedList = useMemo(() => themed($listContent), [themed])

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <FeedPostItem item={item} isNew={hasMarked && isUnseenActivity(item, seenBeforeVisit)} />
    ),
    [hasMarked, seenBeforeVisit],
  )

  const renderSectionHeader = useCallback(
    ({ section }: { section: ActivityFeedSection }) => (
      <Text preset="formLabel" tx={section.titleTx} style={$themedSectionTitle} />
    ),
    [$themedSectionTitle],
  )

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContent}>
      <SectionList<NotificationItem, ActivityFeedSection>
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={$themedList}
        ListHeaderComponent={
          <View style={$themedHeading}>
            <Text preset="heading" tx="feedScreen:title" />
            <Text tx="feedScreen:subtitle" style={$themedSubtitle} />
          </View>
        }
        ListEmptyComponent={
          isListPending ? (
            <ActivityIndicator style={$emptyLoader} />
          ) : (
            <EmptyState
              preset="generic"
              headingTx="feedScreen:emptyHeading"
              contentTx="feedScreen:emptyContent"
            />
          )
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={$footer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />
    </Screen>
  )
}

// #region Styles
const $screenContent: ViewStyle = { flex: 1 }

const $listContent: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  // iOS floating tab bar overlays scroll content; Android bar reserves layout space.
  paddingBottom: Platform.OS === "ios" ? theme.spacing.xxxl + theme.spacing.xxl : theme.spacing.lg,
})

const $heading: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.lg + theme.spacing.xl,
  marginBottom: theme.spacing.md,
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xxs,
})

const $sectionTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xs,
  marginBottom: theme.spacing.xs,
})

const $emptyLoader: ViewStyle = { marginTop: 48 }

const $footer: ViewStyle = { paddingVertical: 16 }
// #endregion
