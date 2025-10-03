import { observer } from "mobx-react-lite"
import { useEffect, useState, useMemo } from "react"
import { ActivityIndicator, Alert, ImageStyle, View, ViewStyle } from "react-native"
import { Divider, EmptyState, ListView, Screen, SearchBar } from "src/components"
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
import { RecipeBrief } from "src/models/Recipe"

export default observer(function Cookbook() {
  const {
    cookbookStore: { selected, setSelectedById, remove, hasFavorite },
    recipeStore,
    membershipStore,
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()

  const isAuthor = membershipStore.ownMembership?.isCreator

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  //const debouncedSearchQuery = useDebounce(searchQuery)

  // Memoize themed styles
  const $themedEmptyState = useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = useMemo(() => themed($emptyStateImage), [themed])
  const $themedBorderTop = useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = useMemo(() => themed($borderBottom), [themed])
  const $themedListItemStyle = useMemo(() => themed($listItemStyle), [themed])
  const $themedRoot = useMemo(() => themed($root), [themed])

const q = searchQuery.trim().toLowerCase()
const filteredItems = q
  ? recipeStore.recipes.filter(r => r.title.toLowerCase().includes(q)).slice()
  : recipeStore.recipes.slice()

  const handlePressEdit = () => {
    if (!isAuthor) return
    router.push(`/cookbook/${id}/edit`)
  }

  const handlePressLeave = async () => {
    // Check if cookbook is in favorites
    if (selected && hasFavorite(selected)) {
      Alert.alert(
        "Cannot Leave Cookbook",
        "Please remove this cookbook from your favorites before leaving.",
        [
          {
            text: "OK",
            style: "cancel",
          },
        ],
      )
      return
    }

    // TODO should refresh currentCookbook here to ensure membersCount is up to date.
    if (isAuthor && selected?.membersCount !== 1) {
      Alert.alert(
        "Leave Cookbook",
        "Please transfer ownership to another member first ('Manage your cookbooks' in the Profile tab).",
        [
          {
            text: "OK",
            style: "cancel",
          },
        ],
      )
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
            const result = await membershipStore.delete(membershipStore.ownMembership?.id)
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
    const options = isAuthor
      ? ["Add Recipe", "Edit Cookbook", "Leave Cookbook", "Cancel"]
      : ["Add Recipe", "Leave Cookbook", "Cancel"]
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

        switch (options[buttonIndex]) {
          case "Add Recipe":
            router.push(`/(app)/recipe/add-options`)
            break
          case "Edit Cookbook":
            handlePressEdit()
            break
          case "Leave Cookbook":
            handlePressLeave()
            break
        }
      },
    )
  }

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([recipeStore.fetch(Number(id)), delay(750)])
    setRefreshing(false)
  }

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    let alive = true
    ;(async () => {
      setIsLoading(true)

      // clear old list so UI doesn't show previous cookbook
      recipeStore.clear()

      setSelectedById(Number(id))
      await Promise.all([
        recipeStore.fetch(Number(id)),
        membershipStore.single(Number(id)),
      ])

      if (alive) setIsLoading(false)
    })()
    return () => { alive = false }
  }, [id])

  // re-fetch recipes when the search query changes
  // useEffect(() => {
  //   setIsLoading(true)
  //   const fetchData = async () => {
  //     await recipeStore.fetch(Number(id), searchQuery)
  //   }
  //   fetchData()
  //   setIsLoading(false)
  // }, [debouncedSearchQuery, recipeStore.fetch])

  useHeader(
    {
      title: selected?.title ?? "",
      leftIcon: "back",
      onLeftPress: () => router.back(),
      rightIcon: "more",
      onRightPress: selected ? () => handlePressMore() : undefined,
    },
    [selected?.title, id],
  )

  const handlePressRecipe = (recipeId: number) => {
    router.push(`/(app)/recipe/${recipeId}`)
  }

  if (!selected) return <ItemNotFound message="Cookbook not found" />

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <ListView<RecipeBrief>
        data={filteredItems}
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
              index === recipeStore.recipes?.length - 1 && $themedBorderBottom,
            ]}
          >
            <RecipeListItem
              text={item.title}
              index={index}
              lastIndex={filteredItems.length - 1}
              onPress={() => handlePressRecipe(item.id)}
            />
          </View>
        )}
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
