import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"
import { Divider, EmptyState, ListView, Screen, SearchBar, Text } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { Href, router, useLocalSearchParams } from "expo-router"
import { delay } from "src/utils/delay"
import { Recipe, RecipeBrief } from "src/models/Recipe"
import { isRTL, translate } from "src/i18n"
import { useDebounce } from "src/models/helpers/useDebounce"
import { RecipeListItem } from "src/components/Recipe/RecipeListItem"
import { PaginationControls } from "src/components/PaginationControls"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useHeader } from "src/utils/useHeader"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { ItemNotFound } from "src/components/ItemNotFound"

export default observer(function Cookbook() {
  const {
    cookbookStore: { currentCookbook, setCurrentCookbook, remove },
    recipeStore,
    membershipStore,
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()

  // Update currentCookbook when id changes
  useEffect(() => {
    setCurrentCookbook(Number(id))
  }, [id, setCurrentCookbook])

  const isAuthor = currentCookbook?.authorEmail?.toLowerCase() === membershipStore.email?.toLowerCase() && !!membershipStore.email

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery)

  // Memoize themed styles
  const $themedContainer = React.useMemo(() => themed($container), [themed])
  const $themedTitle = React.useMemo(() => themed($title), [themed])
  const $themedEmptyState = React.useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = React.useMemo(() => themed($emptyStateImage), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedHeaderContainer = React.useMemo(() => themed($headerContainer), [themed])
  const $themedRight = React.useMemo(() => themed($right), [themed])
  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedRoot = React.useMemo(() => themed($root), [themed])

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      await membershipStore.fetchEmail()
      await membershipStore.single(currentCookbook?.id ?? 0)
      await recipeStore.fetch(Number(id))
    }
    
    fetchData()
    setIsLoading(false)
  }, [recipeStore, currentCookbook, id])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([recipeStore.fetch(Number(id), searchQuery), delay(750)])
    setRefreshing(false)
  }

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
    title: currentCookbook?.title ?? "",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightIcon: "more",
    onRightPress: () => handlePressMore(),
  }, [currentCookbook?.title, id])

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
    if (isAuthor && currentCookbook?.membersCount !== 1) {
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
                //router.back()
              } else {
                Alert.alert("Error", "Failed to leave cookbook. Please try again.")
              }
          },
        },
      ],
    )
  }

  const handlePressMore = () => {

    showActionSheetWithOptions(
      {
        options: ["Edit Cookbook", "Leave Cookbook", "Cancel"],
        cancelButtonIndex: 3,
        destructiveButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          handlePressEdit()
        } else if (buttonIndex === 1) {
          handlePressLeave()
        }
      },
    )
  }

    if (!currentCookbook) return <ItemNotFound message="Cookbook not found" />

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <ListView<RecipeBrief>
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

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
})

const $title: ThemedStyle<ViewStyle> = (theme) => ({
  marginBottom: theme.spacing.md,
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

const $headerContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: theme.spacing.xl,
  paddingHorizontal: theme.spacing.md,
  marginBottom: theme.spacing.xl,
})

const $right: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "right",
})

const $listItemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  paddingHorizontal: theme.spacing.md,
  marginHorizontal: theme.spacing.lg,
})

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
})
