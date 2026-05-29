import { EmptyState } from "@/components/EmptyState"
import { PaginationControls } from "@/components/PaginationControls"
import { RecipeListItem } from "@/components/Recipe/RecipeListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { isRTL } from "@/i18n"
import { Membership } from "@/models/Membership"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, FlatList, ImageStyle, View, ViewStyle } from "react-native"

export default observer(function Cookbook() {
  const { authenticationStore, cookbookStore, membershipStore } = useStores()
  const id = cookbookStore.selected?.id ?? 0
  const { themed } = useAppTheme()

  const [isLoading, setIsLoading] = useState(false)
  const currentUserEmail = authenticationStore.authEmail

  const { refreshing, onRefresh } = useManualRefresh(
    useCallback(
      () => Promise.all([membershipStore.fetch(id), membershipStore.singleByCookbookId(id)]),
      [membershipStore, id],
    ),
  )

  // Memoize themed styles
  const $themedEmptyState = React.useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = React.useMemo(() => themed($emptyStateImage), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedRoot = React.useMemo(() => themed($root), [themed])

  useHeader({
    leftIcon: "back",
    titleTx: "membershipScreen:listTitle",
    onLeftPress: () => router.back(),
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([membershipStore.fetch(id), membershipStore.singleByCookbookId(id)])
      setIsLoading(false)
    }
    fetchData()
  }, [membershipStore, id])

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
    <Screen preset="fixed" style={$themedRoot}>
      <FlatList<Membership>
        data={membershipStore.memberships?.items?.slice() ?? []}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$themedEmptyState}
              buttonOnPress={onRefresh}
              imageStyle={$themedEmptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <Text
            tx="membershipScreen:subtitle"
            style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
          />
        }
        onRefresh={onRefresh}
        refreshing={refreshing}
        renderItem={({ item, index }) => {
          const isCurrentUser =
            !!currentUserEmail && item.email?.toLowerCase() === currentUserEmail.toLowerCase()
          return (
            <View
              style={[
                $themedListItemStyle,
                index === 0 && $themedBorderTop,
                index === membershipStore.memberships?.items?.length - 1 && $themedBorderBottom,
              ]}
            >
              <RecipeListItem
                index={index}
                lastIndex={membershipStore.memberships?.items?.length - 1}
                text={`${item.name ?? item.email}`}
                isOwner={item.isOwner}
                onPress={async () => {
                  router.push(`/(logged-in)/membership/${item.id}`)
                }}
                TextProps={isCurrentUser ? { weight: "bold" } : undefined}
              />
            </View>
          )
        }}
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

const $emptyState: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.xxl,
  paddingHorizontal: theme.spacing.md,
})

const $emptyStateImage: ThemedStyle<ImageStyle> = (theme) => ({
  transform: [{ scaleX: isRTL ? -1 : 1 }],
})

const $borderTop: ThemedStyle<ViewStyle> = (theme) => ({
  borderTopLeftRadius: theme.spacing.xs,
  borderTopRightRadius: theme.spacing.xs,
  paddingTop: theme.spacing.lg,
})

const $borderBottom: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomLeftRadius: theme.spacing.xs,
  borderBottomRightRadius: theme.spacing.xs,
  paddingBottom: theme.spacing.lg,
})

const $listItemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  paddingHorizontal: theme.spacing.md,
  marginHorizontal: theme.spacing.lg,
})

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
})
