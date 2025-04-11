import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  ImageStyle,
  View,
  ViewStyle,
} from "react-native"
import { Divider, EmptyState, ListView, Screen, SearchBar, Text } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { spacing } from "src/theme"
import { Href, router, useLocalSearchParams } from "expo-router"
import { delay } from "src/utils/delay"
import { isRTL, translate } from "src/i18n"
import { useDebounce } from "src/models/helpers/useDebounce"
import { RecipeListItem } from "src/components/Recipe/RecipeListItem"
import { PaginationControls } from "src/components/PaginationControls"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useHeader } from "src/utils/useHeader"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { ItemNotFound } from "src/components/ItemNotFound"
import { Recipe } from "src/models/Recipe"

export default observer(function Cookbook() {
  const {
    cookbookStore: { selected, setSelectedById, remove },
    recipeStore,
    membershipStore,
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()

  

  const isAuthor = selected?.authorEmail?.toLowerCase() === membershipStore.email?.toLowerCase() && !!membershipStore.email

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery)

  // Memoize themed styles
  const $themedEmptyState = React.useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = React.useMemo(() => themed($emptyStateImage), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedRoot = React.useMemo(() => themed($root), [themed])

  const handleNextPage = async () => {
    if (recipeStore.recipes?.hasNextPage) {
      setIsLoading(true)
      await recipeStore.fetch(Number(id), searchQuery, recipeStore.recipes?.pageNumber + 1)
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (recipeStore.recipes?.hasPreviousPage) {
      setIsLoading(true)
      await recipeStore.fetch(Number(id), searchQuery, recipeStore.recipes?.pageNumber - 1)
      setIsLoading(false)
    }
  }

  const handlePressEdit = () => {
    if (!isAuthor) return
    router.push(`/cookbook/${id}/edit`)
  }

  const handlePressLeave = async () => {
    // TODO should refresh currentCookbook here to ensure membersCount is up to date.
    if (isAuthor && selected?.membersCount !== 1) {
      Alert.alert("Leave Cookbook", "Please transfer cookbook ownership to another member first ('Manage your cookbooks' in the Profile tab).", [
        {
          text: "OK",
          style: "cancel",
        },
      ])
      return
    }

    Alert.alert(
      "Leave Cookbook",
      "Are you sure you want to leave this cookbook? You will have to be invited back to join again.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            if (!membershipStore.ownMembership?.id) return
              var result = await membershipStore.delete(membershipStore.ownMembership?.id)
              if (result) {
                remove()
              } else {
                Alert.alert("Error", "Failed to leave cookbook. Please try again.")
              }
          },
        },
      ],
    )
  }

  const handlePressMore = () => {
    const options = isAuthor ? ["Edit Cookbook", "Leave Cookbook", "Cancel"] : ["Leave Cookbook", "Cancel"]
    const cancelButtonIndex = options.length - 1
    const destructiveButtonIndex = options.indexOf("Leave Cookbook")

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return

        if (buttonIndex === 0 && isAuthor) {
          handlePressEdit()
        } else if (buttonIndex === (isAuthor ? 1 : 0)) {
          handlePressLeave()
        }
      },
    )
  }

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([recipeStore.fetch(Number(id), searchQuery), delay(750)])
    setRefreshing(false)
  }

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      setSelectedById(Number(id))
      if (selected) {
        await membershipStore.fetchEmail()
        await membershipStore.single(Number(id))
        await recipeStore.fetch(Number(id))
      }
    }
    fetchData()
    setIsLoading(false)
  }, [id, setSelectedById, membershipStore.fetchEmail, membershipStore.single, recipeStore.fetch])

  // re-fetch recipes when the search query changes
  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      await recipeStore.fetch(Number(id), searchQuery)
    }
    fetchData()
    setIsLoading(false)
  }, [debouncedSearchQuery, recipeStore.fetch])

  useHeader({
    title: selected?.title ?? "",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightIcon: "more",
    onRightPress: selected ? () => handlePressMore() : undefined,
  }, [selected?.title, id])

  if (!selected) return <ItemNotFound message="Cookbook not found" />

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <ListView<Recipe>
        data={recipeStore.recipes?.items?.slice() ?? []}
        estimatedItemSize={59}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$themedEmptyState}
              buttonOnPress={manualRefresh}
              imageStyle={$themedEmptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={translate("recipeListScreen:searchPlaceholder")}
            />
            <Divider size={spacing.sm} />
          </View>
        }
        onRefresh={manualRefresh}
        refreshing={refreshing}
        renderItem={({ item, index }) => (
          <View
            style={[
              $themedListItemStyle,
              index === 0 && $themedBorderTop,
              index === recipeStore.recipes?.items?.length - 1 && $themedBorderBottom,
            ]}
          >
            <RecipeListItem
              text={item.title}
              index={index}
              lastIndex={recipeStore.recipes?.items?.length - 1}
              onPress={async () => {
                await recipeStore.single(item.id)
                router.push(`(app)/recipe/${item.id}` as Href<`(app)/recipe/${number}`>)
              }}
            />
          </View>
        )}
        ListFooterComponent={
          <>
            {recipeStore.recipes?.hasMultiplePages && (
              <PaginationControls
                currentPage={recipeStore.recipes.pageNumber}
                totalPages={recipeStore.recipes.totalPages}
                totalCount={recipeStore.recipes.totalCount}
                hasNextPage={recipeStore.recipes.hasNextPage}
                hasPreviousPage={recipeStore.recipes.hasPreviousPage}
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
