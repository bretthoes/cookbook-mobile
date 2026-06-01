import { EmptyState } from "@/components/EmptyState"
import { FeedPostItem } from "@/components/activity/FeedPostItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useNotificationsList } from "@/hooks/queries/useNotificationsQuery"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import type { NotificationItem } from "@/types/notification"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { useCallback } from "react"
import { ActivityIndicator, FlatList, TextStyle, View, ViewStyle } from "react-native"

export default function ActivityFeedScreen() {
  const { notifications, isListPending, listHasNextPage, isLoadingMore, refetch, fetchNextPage } =
    useNotificationsList()

  useHeader({
    leftIcon: "back",
    titleTx: "activityFeedScreen:title",
    onLeftPress: () => router.back(),
  })

  const { refreshing, onRefresh } = useManualRefresh(useCallback(() => refetch(), [refetch]))

  const handleLoadMore = useCallback(() => {
    if (!listHasNextPage || isLoadingMore) return
    void fetchNextPage()
  }, [listHasNextPage, isLoadingMore, fetchNextPage])

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => <FeedPostItem item={item} />,
    [],
  )

  return (
    <Screen preset="fixed" contentContainerStyle={$screenContent}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={$listContent}
        ListHeaderComponent={<Text tx="activityFeedScreen:subtitle" style={$subtitle} />}
        ListEmptyComponent={
          isListPending ? (
            <ActivityIndicator style={$emptyLoader} />
          ) : (
            <EmptyState
              preset="generic"
              headingTx="activityFeedScreen:emptyHeading"
              contentTx="activityFeedScreen:emptyContent"
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

const $screenContent: ViewStyle = { flex: 1 }

const $listContent: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl,
}

const $subtitle: TextStyle = {
  paddingBottom: spacing.lg,
}

const $emptyLoader: ViewStyle = { marginTop: spacing.xxl }

const $footer: ViewStyle = { paddingVertical: spacing.md }
