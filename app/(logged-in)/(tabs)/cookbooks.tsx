import { LatestActivitySection } from "@/components/activity/LatestActivitySection"
import { EmptyState } from "@/components/EmptyState"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { CookbookCard } from "@/components/cookbooks/CookbookCard"
import { useCookbooksList } from "@/hooks/queries/useCookbooksQuery"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { isRTL } from "@/i18n"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import type { CookbookItem } from "@/types/cookbook"
import { getCookbooksForList } from "@/utils/cookbookList"
import { useRouter } from "expo-router"
import { useCallback, useMemo } from "react"
import {
  ActivityIndicator,
  FlatList,
  ImageStyle,
  Pressable,
  View,
  ViewStyle,
} from "react-native"
import { useTranslation } from "react-i18next"

export default function CookbooksScreen(_props: void) {
  const router = useRouter()
  const { themeContext } = useAppTheme()
  const { t } = useTranslation()
  const isDark = themeContext === "dark"

  const { cookbooks, isListPending, listHasNextPage, isLoadingMore, refetch, fetchNextPage } =
    useCookbooksList()

  const cookbooksForList = useMemo(() => getCookbooksForList(cookbooks), [cookbooks])

  const { refreshing, onRefresh } = useManualRefresh(useCallback(() => refetch(), [refetch]))

  const handleLoadMore = useCallback(() => {
    if (!listHasNextPage || isLoadingMore) return
    void fetchNextPage()
  }, [listHasNextPage, isLoadingMore, fetchNextPage])

  const renderItem = useCallback(
    ({ item }: { item: CookbookItem }) => <CookbookCard cookbook={item} isDark={isDark} />,
    [isDark],
  )

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContentContainer}>
      <FlatList
        contentContainerStyle={$listContentContainer}
        data={cookbooksForList}
        keyExtractor={(item) => String(item.id)}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          isListPending ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              contentTx="cookbooksScreen:cookbookListScreen.noCookbooksEmptyState"
              contentTxOptions={{ tabName: t("tabNavigator:createTab") }}
              buttonOnPress={onRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <View style={$headingRow}>
              <Text preset="heading" tx="cookbooksScreen:title" />
              <Pressable
                onPress={() => router.push("/(logged-in)/activity")}
                accessibilityLabel={t("cookbooksScreen:activityFeedAccessibility")}
                style={$feedButton}
              >
                <Icon icon="community" size={28} />
              </Pressable>
            </View>
          </View>
        }
        ListFooterComponent={
          <>
            {isLoadingMore ? (
              <View style={$footerLoader}>
                <ActivityIndicator />
              </View>
            ) : null}
            <LatestActivitySection />
          </>
        }
        renderItem={renderItem}
      />
    </Screen>
  )
}

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl + spacing.xxl,
}

const $heading: ViewStyle = {
  marginBottom: spacing.md,
  paddingTop: spacing.lg + spacing.xl,
}

const $headingRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $feedButton: ViewStyle = {
  padding: spacing.xs,
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
