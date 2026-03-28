import { Popover } from "@/components/Popover"
import { Divider } from "@/components/Divider"
import { EmptyState } from "@/components/EmptyState"
import { ItemNotFound } from "@/components/ItemNotFound"
import { RecipeListItem } from "@/components/Recipe/RecipeListItem"
import { Screen } from "@/components/Screen"
import { SearchBar } from "@/components/SearchBar"
import { Text } from "@/components/Text"
import { isRTL } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { RecipeBrief } from "@/models/Recipe"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { delay } from "@/utils/delay"
import { useHeader } from "@/utils/useHeader"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import { useTranslation } from "react-i18next"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

type TagKey = keyof typeof TAG_DEFINITIONS

const TAG_DEFINITIONS = {
  isVegetarian: "Vegetarian",
  isVegan: "Vegan",
  isGlutenFree: "Gluten Free",
  isDairyFree: "Dairy Free",
  isHealthy: "Healthy",
  isCheap: "Cheap",
  isLowFodmap: "Low FODMAP",
  isHighProtein: "High Protein",
  isBreakfast: "Breakfast",
  isLunch: "Lunch",
  isDinner: "Dinner",
  isDessert: "Dessert",
  isSnack: "Snack",
} as const

export default observer(function Cookbook() {
  const {
    cookbookStore: { selected, setSelectedById, remove, hasFavorite },
    recipeStore,
    membershipStore,
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()

  const isAuthor = membershipStore.ownMembership?.isOwner

  const [refreshing, setRefreshing] = useState(false)
  const [popoverVisible, setPopoverVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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
  let filteredItems = recipeStore.recipes.slice()
  if (q) {
    filteredItems = filteredItems.filter((r) => r.title.toLowerCase().includes(q))
  }
  if (selectedTags.size > 0) {
    filteredItems = filteredItems.filter((r) =>
      Array.from(selectedTags).every((tag) => r[tag] === true),
    )
  }

  const handlePressEdit = useCallback(() => {
    if (!isAuthor) return
    router.push(`./${id}/edit`)
  }, [isAuthor, id])

  const handlePressLeave = useCallback(async () => {
    // Check if cookbook is in favorites
    if (selected && hasFavorite(selected)) {
      Alert.alert(
        t("cookbookDetailScreen:leaveCannotRemoveFavoritesTitle"),
        t("cookbookDetailScreen:leaveCannotRemoveFavorites"),
        [
          {
            text: t("common:ok"),
            style: "cancel",
          },
        ],
      )
      return
    }

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
            if (!membershipStore.ownMembership?.id) return
            const result = await membershipStore.delete(membershipStore.ownMembership?.id)
            if (result) {
              remove()
            } else {
              Alert.alert(t("common:error"), t("cookbookDetailScreen:leaveError"))
            }
          },
        },
      ],
    )
  }, [isAuthor, selected, hasFavorite, membershipStore, remove, t])

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
    [isAuthor, handlePressEdit, handlePressLeave],
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

  if (!selected) return <ItemNotFound messageTx="itemNotFound:cookbook" />

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
                contentTx="cookbookDetailScreen:noRecipesEmpty"
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
                placeholder={t("recipeListScreen:searchPlaceholder")}
                leftIcon={filterExpanded ? "filterFilled" : "filter"}
                leftIconColor={
                  selectedTags.size > 0 ? theme.colors.tint : theme.colors.textDim
                }
                onLeftIconPress={() => setFilterExpanded((v) => !v)}
              />
              {filterExpanded && (
                <View style={themed($tagChipContainer)}>
                  {(Object.keys(TAG_DEFINITIONS) as TagKey[]).map((tag) => {
                    const isSelected = selectedTags.has(tag)
                    return (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={[themed($tagChip), isSelected && themed($tagChipSelected)]}
                        activeOpacity={0.7}
                      >
                        <Text
                          size="xs"
                          weight={isSelected ? "semiBold" : "normal"}
                          text={TAG_DEFINITIONS[tag]}
                          style={isSelected ? themed($tagChipTextSelected) : undefined}
                        />
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )}
              <Divider size={spacing.sm} />
            </View>
          }
          onRefresh={manualRefresh}
          refreshing={refreshing}
          ListFooterComponent={
            <View style={$themedListFooter}>
              <Text
                weight="light"
                text={t("cookbookDetailScreen:recipeCount", {
                  count: filteredItems.length,
                })}
              />
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

const $tagChipSelected: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
})

const $tagChipTextSelected: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
})
