import { Popover } from "@/components/Popover"
import { Divider } from "@/components/Divider"
import { EmptyState } from "@/components/EmptyState"
import { ItemNotFound } from "@/components/ItemNotFound"
import { RecipeListItem } from "@/components/Recipe/RecipeListItem"
import {
  getRecipeTagChipColor,
  RECIPE_TAG_CHIP_TEXT_COLOR,
} from "@/components/Recipe/recipeTagColors"
import { Screen } from "@/components/Screen"
import { SearchBar } from "@/components/SearchBar"
import { Text } from "@/components/Text"
import { useRecipesList } from "@/hooks/queries/useRecipesQuery"
import { useSelectedCookbook } from "@/hooks/useSelectedCookbook"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { TxKeyPath, isRTL } from "@/i18n"
import { invalidateCookbookLists } from "@/services/query/invalidateQueries"
import { isOwnerTier } from "@/utils/membershipTier"
import { useMembershipStore } from "@/stores/membershipStore"
import { useUiStore } from "@/stores/uiStore"
import type { RecipeBriefItem } from "@/types/recipe"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { useQueryClient } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import { useTranslation } from "react-i18next"
import { useCallback, useLayoutEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

const RECIPE_TAG_KEYS = [
  "isVegetarian",
  "isVegan",
  "isGlutenFree",
  "isDairyFree",
  "isHealthy",
  "isCheap",
  "isLowFodmap",
  "isHighProtein",
  "isBreakfast",
  "isLunch",
  "isDinner",
  "isDessert",
  "isSnack",
] as const

type TagKey = (typeof RECIPE_TAG_KEYS)[number]

function tagLabelTx(tag: TagKey): TxKeyPath {
  return `cookbookDetailScreen:tags.${tag}` as TxKeyPath
}

export default function CookbookScreen() {
  const queryClient = useQueryClient()
  const ownMembership = useMembershipStore((s) => s.ownMembership)
  const singleByCookbookId = useMembershipStore((s) => s.singleByCookbookId)
  const deleteMembership = useMembershipStore((s) => s.delete)
  const setSelectedCookbookId = useUiStore((s) => s.setSelectedCookbookId)
  const { selected, setSelectedById } = useSelectedCookbook()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()

  const isAuthor = isOwnerTier(ownMembership?.tier)

  const [popoverVisible, setPopoverVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const cookbookId = id ?? ""
  const {
    recipes,
    isListPending,
    listHasNextPage,
    isLoadingMore,
    refetch,
    fetchNextPage,
    data: recipesQueryData,
  } = useRecipesList(cookbookId)
  const recipeListTotalCount = recipesQueryData?.pages[0]?.totalCount ?? recipes.length
  const { refreshing, onRefresh } = useManualRefresh(useCallback(() => refetch(), [refetch]))
  const [selectedTags, setSelectedTags] = useState<Set<TagKey>>(new Set())
  const [filterExpanded, setFilterExpanded] = useState(false)
  //const debouncedSearchQuery = useDebounce(searchQuery)

  // Memoize themed styles
  const $themedEmptyState = useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = useMemo(() => themed($emptyStateImage), [themed])
  const $themedBorderTop = useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = useMemo(() => themed($borderBottom), [themed])
  const $themedListItemStyle = useMemo(() => themed($listItemStyle), [themed])
  const $themedRoot = useMemo(() => themed($root), [themed])
  const $themedListFooter = useMemo(() => themed($listFooter), [themed])

  const toggleTag = useCallback((tag: TagKey) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) {
        next.delete(tag)
      } else {
        next.add(tag)
      }
      return next
    })
  }, [])

  const q = searchQuery.trim().toLowerCase()
  const hasActiveFilters = q.length > 0 || selectedTags.size > 0
  let filteredItems = recipes.slice()
  if (q) {
    filteredItems = filteredItems.filter((r) => r.title.toLowerCase().includes(q))
  }
  if (selectedTags.size > 0) {
    filteredItems = filteredItems.filter((r) =>
      Array.from(selectedTags).every((tag) => r[tag] === true),
    )
  }

  const handleLoadMore = useCallback(() => {
    if (!listHasNextPage || isLoadingMore) return
    void fetchNextPage()
  }, [listHasNextPage, isLoadingMore, fetchNextPage])

  const handlePressEdit = useCallback(() => {
    if (!isAuthor) return
    router.push(`./${id}/edit`)
  }, [isAuthor, id])

  const handlePressLeave = useCallback(async () => {
    // TODO should refresh currentCookbook here to ensure membersCount is up to date.
    if (isAuthor && selected?.membersCount !== 1) {
      Alert.alert(
        t("cookbookDetailScreen:leaveConfirmTitle"),
        t("cookbookDetailScreen:leaveTransferOwnershipFirst"),
        [
          {
            text: t("common:ok"),
            style: "cancel",
          },
        ],
      )
      return
    }

    Alert.alert(
      t("cookbookDetailScreen:leaveConfirmTitle"),
      t("cookbookDetailScreen:leaveConfirmMessage"),
      [
        {
          text: t("common:cancel"),
          style: "cancel",
        },
        {
          text: t("cookbookDetailScreen:leaveButton"),
          style: "destructive",
          onPress: async () => {
            if (!ownMembership?.id) return
            const result = await deleteMembership(ownMembership.id)
            if (result) {
              setSelectedCookbookId(null)
              void invalidateCookbookLists(queryClient)
              router.replace("/(logged-in)/(tabs)/cookbooks")
            } else {
              Alert.alert(t("common:error"), t("cookbookDetailScreen:leaveError"))
            }
          },
        },
      ],
    )
  }, [isAuthor, selected, ownMembership, deleteMembership, setSelectedCookbookId, queryClient, t])

  const handlePressMore = () => setPopoverVisible(true)

  const popoverOptions = useMemo(
    () => [
      {
        key: "addRecipe",
        tx: "cookbookDetailScreen:addRecipe" as const,
        leftIcon: "create" as const,
        onPress: () => router.push("/(logged-in)/recipe/add-options"),
      },
      {
        key: "viewMembers",
        tx: "cookbookDetailScreen:viewMembers" as const,
        leftIcon: "membership" as const,
        onPress: () => router.push("/(logged-in)/membership/list"),
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
    [isAuthor, handlePressEdit, handlePressLeave],
  )

  // Stale-while-revalidate: keep list when revisiting same cookbook; refresh in background.
  useLayoutEffect(() => {
    setSelectedById(cookbookId)
    void singleByCookbookId(cookbookId)
  }, [cookbookId, singleByCookbookId, setSelectedById])

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

  const handlePressRecipe = (recipeId: string) => {
    router.push(`/(logged-in)/recipe/${recipeId}`)
  }

  if (!selected) return <ItemNotFound messageTx="itemNotFound:cookbook" />

  return (
    <>
      <Popover
        visible={popoverVisible}
        onDismiss={() => setPopoverVisible(false)}
        options={popoverOptions}
      />
      <Screen preset="fixed" style={$themedRoot}>
        <FlatList<RecipeBriefItem>
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            isListPending ? (
              <ActivityIndicator />
            ) : (
              <EmptyState
                preset="generic"
                contentTx="cookbookDetailScreen:noRecipesEmpty"
                style={$themedEmptyState}
                buttonOnPress={onRefresh}
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
                placeholder={t("recipeListScreen:searchPlaceholder")}
                leftIcon={filterExpanded ? "filterFilled" : "filter"}
                leftIconColor={selectedTags.size > 0 ? theme.colors.tint : theme.colors.textDim}
                onLeftIconPress={() => setFilterExpanded((v) => !v)}
              />
              {filterExpanded && (
                <View style={themed($tagChipContainer)}>
                  {RECIPE_TAG_KEYS.map((tag) => {
                    const isSelected = selectedTags.has(tag)
                    const chipColor = isSelected ? getRecipeTagChipColor(tag) : undefined
                    return (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={[
                          themed($tagChip),
                          chipColor && {
                            backgroundColor: chipColor,
                            borderColor: chipColor,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          size="xs"
                          weight={isSelected ? "semiBold" : "normal"}
                          tx={tagLabelTx(tag)}
                          style={chipColor ? { color: RECIPE_TAG_CHIP_TEXT_COLOR } : undefined}
                        />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
              <Divider size={spacing.sm} />
            </View>
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            <View style={$themedListFooter}>
              {isLoadingMore && <ActivityIndicator />}
              <Text
                weight="light"
                tx={
                  hasActiveFilters
                    ? "cookbookDetailScreen:recipeCount"
                    : recipeListTotalCount > recipes.length
                      ? "cookbookDetailScreen:recipeCountLoaded"
                      : "cookbookDetailScreen:recipeCount"
                }
                txOptions={
                  hasActiveFilters
                    ? { count: filteredItems.length }
                    : recipeListTotalCount > recipes.length
                      ? {
                          loaded: recipes.length,
                          total: recipeListTotalCount,
                        }
                      : { count: recipeListTotalCount }
                }
              />
            </View>
          }
          renderItem={({ item, index }) => (
            <View
              style={[
                $themedListItemStyle,
                index === 0 && $themedBorderTop,
                index === filteredItems.length - 1 && $themedBorderBottom,
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
}

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

const $tagChipContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.sm,
  paddingTop: theme.spacing.xs,
  paddingBottom: theme.spacing.sm,
  marginHorizontal: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  borderBottomLeftRadius: theme.spacing.xs,
  borderBottomRightRadius: theme.spacing.xs,
})

const $tagChip: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xxs,
  borderRadius: theme.spacing.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.background,
})
