import { EmptyState } from "@/components/EmptyState"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { CookbookCard } from "@/components/cookbooks/CookbookCard"
import { Switch } from "@/components/Toggle"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { isRTL } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect } from "react"
import { ActivityIndicator, FlatList, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { useTranslation } from "react-i18next"

export default observer(function CookbooksScreen(_props) {
  const { cookbookStore } = useStores()
  const { themeContext } = useAppTheme()
  const { t } = useTranslation()
  const isDark = themeContext === "dark"

  const isListPending = cookbookStore.isListPending

  const { refreshing, onRefresh } = useManualRefresh(
    useCallback(() => cookbookStore.fetch(), [cookbookStore]),
  )

  useEffect(() => {
    cookbookStore.fetch()
  }, [cookbookStore])

  const handleLoadMore = useCallback(() => {
    if (cookbookStore.favoritesOnly) return
    if (!cookbookStore.listHasNextPage || cookbookStore.isLoadingMoreCookbooks) return
    cookbookStore.fetchMore()
  }, [cookbookStore])

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContentContainer}>
      <FlatList
        contentContainerStyle={$listContentContainer}
        data={cookbookStore.cookbooksForList.slice()}
        extraData={cookbookStore.favorites.length + cookbookStore.cookbooks.length}
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
                cookbookStore.favoritesOnly
                  ? "cookbooksScreen:cookbookListScreen.noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                cookbookStore.favoritesOnly
                  ? "cookbooksScreen:cookbookListScreen.noFavoritesEmptyState.content"
                  : "cookbooksScreen:cookbookListScreen.noCookbooksEmptyState"
              }
              contentTxOptions={
                cookbookStore.favoritesOnly ? undefined : { tabName: t("tabNavigator:createTab") }
              }
              button={cookbookStore.favoritesOnly ? "" : undefined}
              buttonOnPress={onRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="cookbooksScreen:title" />
            {(cookbookStore.favoritesOnly || cookbookStore.cookbooksForList.length > 0) && (
              <View style={$toggle}>
                <Switch
                  value={cookbookStore.favoritesOnly}
                  onValueChange={() =>
                    cookbookStore.setProp("favoritesOnly", !cookbookStore.favoritesOnly)
                  }
                  labelTx="cookbooksScreen:onlyFavorites"
                  labelPosition="left"
                  labelStyle={$labelStyle}
                  accessibilityLabel={t("cookbooksScreen:accessibility.switch")}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CookbookCard
            cookbook={item}
            isFavorite={cookbookStore.hasFavorite(item)}
            onPressFavorite={() => cookbookStore.toggleFavorite(item)}
            isDark={isDark}
          />
        )}
      />
    </Screen>
  )
})

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
