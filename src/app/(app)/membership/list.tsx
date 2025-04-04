import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Divider, EmptyState, ListView, Screen, Text } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { Href, router } from "expo-router"
import { delay } from "src/utils/delay"
import { isRTL } from "src/i18n"
import { PaginationControls } from "src/components/PaginationControls"
import { Membership } from "src/models"
import { RecipeListItem } from "src/components/Recipe/RecipeListItem"
import { useHeader } from "src/utils/useHeader"

export default observer(function Cookbook() {
  const { cookbookStore, recipeStore, membershipStore } = useStores()
  const id = cookbookStore.currentCookbook?.id ?? 0

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useHeader({
    leftIcon: "back",
    title: "Members",
    onLeftPress: () => router.back(),
  })

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    const fetchData = async () => {
      await membershipStore.fetch(id)
    }
    setIsLoading(true)
    fetchData()
      .catch(console.error)
    setIsLoading(false)
  }, [membershipStore])

  useEffect(() => {
    setIsLoading(true)
    const reload = async () => {
      await membershipStore.fetch(id)
    }
    reload()
    setIsLoading(false)
  }, [membershipStore.fetch])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([membershipStore.fetch(id), delay(750)])
    setRefreshing(false)
  }

  const handleNextPage = async () => {
    if (membershipStore.memberships?.hasNextPage) {
      setIsLoading(true)
      await membershipStore.fetch(id, membershipStore.memberships.pageNumber + 1)
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (membershipStore.memberships?.hasPreviousPage) {
      setIsLoading(true)
      await membershipStore.fetch(id, membershipStore.memberships.pageNumber - 1)
      setIsLoading(false)
    }
  }

  if (!id) return null

  return (
    <Screen preset="scroll" style={$root}>
      <ListView<Membership>
        data={membershipStore.memberships?.items?.slice() ?? []}
        estimatedItemSize={59}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <Text
            text="Manage your cookbook members."
            style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
          />
        }
        onRefresh={manualRefresh}
        refreshing={refreshing}
        renderItem={({ item, index }) => (
          <View
            style={[
              $listItemStyle,
              index === 0 && $borderTop,
              index === membershipStore.memberships?.items?.length - 1 && $borderBottom,
            ]}
          >
            <RecipeListItem
              index={index}
              lastIndex={membershipStore.memberships?.items?.length - 1}
              text={`${item.name ?? item.email}`}
              onPress={async () => {
                router.push(`/membership/${item.id}`)
              }}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {membershipStore.memberships?.hasMultiplePages && (
              <PaginationControls
                currentPage={membershipStore.memberships.pageNumber}
                totalPages={membershipStore.memberships.totalPages}
                totalCount={membershipStore.memberships.totalCount}
                hasNextPage={membershipStore.memberships.hasNextPage}
                hasPreviousPage={membershipStore.memberships.hasPreviousPage}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            )}
          </>
        }
      />
    </Screen>
  )
})

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
  paddingHorizontal: spacing.md,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $borderTop: ViewStyle = {
  borderTopLeftRadius: spacing.xs,
  borderTopRightRadius: spacing.xs,
  paddingTop: spacing.lg,
}

const $borderBottom: ViewStyle = {
  borderBottomLeftRadius: spacing.xs,
  borderBottomRightRadius: spacing.xs,
  paddingBottom: spacing.lg,
}

const $listItemStyle: ViewStyle = {
  backgroundColor: colors.backgroundDim,
  paddingHorizontal: spacing.md,
  marginHorizontal: spacing.lg,
}

const $root: ViewStyle = {
  flex: 1,
}
