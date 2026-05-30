import { EmptyState } from "@/components/EmptyState"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { CookbookCard } from "@/components/cookbooks/CookbookCard"
import { Switch } from "@/components/Toggle"
import { useCookbooksList } from "@/hooks/queries/useCookbooksQuery"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { isRTL } from "@/i18n"
import { useUiStore } from "@/stores/uiStore"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import type { CookbookItem } from "@/types/cookbook"
import { useCallback, useMemo } from "react"
import { ActivityIndicator, FlatList, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { useTranslation } from "react-i18next"

export default function CookbooksScreen(_props: void) {
  const { themeContext } = useAppTheme()
  const { t } = useTranslation()
  const isDark = themeContext === "dark"

  const favoritesOnly = useUiStore((s) => s.favoritesOnly)
  const setFavoritesOnly = useUiStore((s) => s.setFavoritesOnly)
  const favoriteCookbookIds = useUiStore((s) => s.favoriteCookbookIds)
  const toggleFavoriteCookbook = useUiStore((s) => s.toggleFavoriteCookbook)
  const hasFavoriteCookbook = useUiStore((s) => s.hasFavoriteCookbook)

  const { cookbooks, isListPending, listHasNextPage, isLoadingMore, refetch, fetchNextPage } =
    useCookbooksList()

  const cookbooksForList = useMemo(() => {
    if (!favoritesOnly) return cookbooks
    const favoriteSet = new Set(favoriteCookbookIds)
    return cookbooks.filter((c) => favoriteSet.has(c.id))
  }, [cookbooks, favoritesOnly, favoriteCookbookIds])

  const { refreshing, onRefresh } = useManualRefresh(useCallback(() => refetch(), [refetch]))

  const handleLoadMore = useCallback(() => {
    if (favoritesOnly) return
    if (!listHasNextPage || isLoadingMore) return
    void fetchNextPage()
  }, [favoritesOnly, listHasNextPage, isLoadingMore, fetchNextPage])

  const renderItem = useCallback(
    ({ item }: { item: CookbookItem }) => (
      <CookbookCard
        cookbook={item}
        isFavorite={hasFavoriteCookbook(item.id)}
        onPressFavorite={() => toggleFavoriteCookbook(item.id)}
        isDark={isDark}
      />
    ),
    [hasFavoriteCookbook, toggleFavoriteCookbook, isDark],
  )

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContentContainer}>
      <FlatList
        contentContainerStyle={$listContentContainer}
        data={cookbooksForList}
        keyExtractor={(item) => String(item.id)}
        extraData={favoriteCookbookIds.length + cookbooks.length}
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
              headingTx={
                favoritesOnly
                  ? "cookbooksScreen:cookbookListScreen.noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                favoritesOnly
                  ? "cookbooksScreen:cookbookListScreen.noFavoritesEmptyState.content"
                  : "cookbooksScreen:cookbookListScreen.noCookbooksEmptyState"
              }
              contentTxOptions={
                favoritesOnly ? undefined : { tabName: t("tabNavigator:createTab") }
              }
              button={favoritesOnly ? "" : undefined}
              buttonOnPress={onRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="cookbooksScreen:title" />
            {(favoritesOnly || cookbooksForList.length > 0) && (
              <View style={$toggle}>
                <Switch
                  value={favoritesOnly}
                  onValueChange={() => setFavoritesOnly(!favoritesOnly)}
                  labelTx="cookbooksScreen:onlyFavorites"
                  labelPosition="left"
                  labelStyle={$labelStyle}
                  accessibilityLabel={t("cookbooksScreen:accessibility.switch")}
                />
              </View>
            )}
          </View>
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

const $toggle: ViewStyle = {
  marginTop: spacing.md,
}

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}
