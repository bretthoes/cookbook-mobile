import { Popover } from "@/components/Popover"
import { Divider } from "@/components/Divider"
import { EmptyState } from "@/components/EmptyState"
import { ItemNotFound } from "@/components/ItemNotFound"
import { RecipeListItem } from "@/components/Recipe/RecipeListItem"
import { Screen } from "@/components/Screen"
import { SearchBar } from "@/components/SearchBar"
import { Text } from "@/components/Text"
import { isRTL, translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { RecipeBrief } from "@/models/Recipe"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { delay } from "@/utils/delay"
import { useHeader } from "@/utils/useHeader"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo, useState } from "react"
import { ActivityIndicator, Alert, FlatList, ImageStyle, View, ViewStyle } from "react-native"

export default observer(function Cookbook() {
  const {
    cookbookStore: { selected, setSelectedById, remove, hasFavorite },
    recipeStore,
    membershipStore,
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed } = useAppTheme()

  const isAuthor = membershipStore.ownMembership?.isOwner

  const [refreshing, setRefreshing] = useState(false)
  const [popoverVisible, setPopoverVisible] = useState(false)
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
  const $themedListFooter = useMemo(() => themed($listFooter), [themed])

  const q = searchQuery.trim().toLowerCase()
  const filteredItems = q
    ? recipeStore.recipes.filter((r) => r.title.toLowerCase().includes(q)).slice()
    : recipeStore.recipes.slice()

  const handlePressEdit = () => {
    if (!isAuthor) return
    router.push(`./${id}/edit`)
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

  const handlePressMore = () => setPopoverVisible(true)

  const popoverOptions = useMemo(
    () => [
      {
        key: "addRecipe",
        tx: "cookbookDetailScreen:addRecipe" as const,
        leftIcon: "create" as const,
        onPress: () => router.push(`../../recipe/add-options`),
      },
      {
        key: "viewMembers",
        tx: "cookbookDetailScreen:viewMembers" as const,
        leftIcon: "membership" as const,
        onPress: () => router.push(`../../membership/list`),
      },
      ...(isAuthor
        ? [
            {
              key: "editCookbook",
              tx: "cookbookDetailScreen:editCookbook" as const,
              leftIcon: "settings" as const,
              onPress: handlePressEdit,
            },
          ]
        : []),
      {
        key: "leaveCookbook",
        tx: "cookbookDetailScreen:leaveCookbook" as const,
        leftIcon: "x" as const,
        destructive: true,
        onPress: handlePressLeave,
      },
    ],
    [isAuthor],
  )

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
        membershipStore.singleByCookbookId(Number(id)),
      ])

      if (alive) setIsLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [id, recipeStore, membershipStore, setSelectedById])

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
      onLeftPress: () => router.replace("../../(tabs)/cookbooks"),
      rightIcon: "more",
      onRightPress: selected ? () => handlePressMore() : undefined,
    },
    [selected?.title, id],
  )

  const handlePressRecipe = (recipeId: number) => {
    router.push(`../../recipe/${recipeId}`)
  }

  if (!selected) return <ItemNotFound message="Cookbook not found" />

  return (
    <>
      <Popover
        visible={popoverVisible}
        onDismiss={() => setPopoverVisible(false)}
        options={popoverOptions}
      />
      <Screen preset="fixed" style={$themedRoot}>
      <FlatList<RecipeBrief>
        data={filteredItems}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              content={"No recipes have been added yet."}
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
        ListFooterComponent={
          <View style={$themedListFooter}>
            <Text weight="light" text={`${filteredItems.length} recipes.`} />
          </View>
        }
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
    </>
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
  paddingHorizontal: theme.spacing.sm,
  marginHorizontal: theme.spacing.sm,
})

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
})

const $listFooter: ThemedStyle<ViewStyle> = (theme) => ({
  height: theme.spacing.xxxl,
  alignItems: "center",
  justifyContent: "center",
})
