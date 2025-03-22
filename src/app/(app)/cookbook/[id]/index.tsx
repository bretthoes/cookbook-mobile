import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, ImageStyle, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Divider, EmptyState, ListView, Screen, SearchBar, Text } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { Href, router, useLocalSearchParams } from "expo-router"
import { delay } from "src/utils/delay"
import { RecipeBrief } from "src/models/Recipe"
import { isRTL, translate } from "src/i18n"
import { useDebounce } from "src/models/helpers/useDebounce"
import { RecipeListItem } from "src/components/Recipe/RecipeListItem"
import { PaginationControls } from "src/components/PaginationControls"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { MoreButton } from "src/components/MoreButton"

export default observer(function Cookbook() {
  const { cookbookStore, recipeStore, membershipStore: { email, fetchEmail } } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showActionSheetWithOptions } = useActionSheet()

  const cookbook = cookbookStore.cookbooks.find((c) => c.id === Number(id))
  const isAuthor = cookbook?.authorEmail?.toLowerCase() === email?.toLowerCase() && !!email

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      await fetchEmail()
      setIsLoading(true)
      await recipeStore.fetch(Number(id))
      setIsLoading(false)
    })()
  }, [recipeStore])

  useEffect(() => {
    ;(async function reload() {
      await recipeStore.fetch(Number(id), searchQuery)
    })()
  }, [debouncedSearchQuery, recipeStore.fetch])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([cookbookStore.fetch(), delay(750)])
    setRefreshing(false)
  }

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
    router.push(`/cookbook/${id}/edit` as Href<`/cookbook/${string}/edit`>)
  }

  const handlePressDelete = async () => {
    Alert.alert(
      "Delete Cookbook",
      "Are you sure you want to delete this cookbook? This action cannot be undone and will delete all recipes in this cookbook.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await cookbookStore.deleteCookbook(Number(id))
            router.back()
          }
        }
      ]
    )
  }

  const handlePressMore = () => {
    if (!isAuthor) return

    showActionSheetWithOptions({
      options: ["Edit Cookbook", "Delete Cookbook", "Cancel"],
      cancelButtonIndex: 2,
      destructiveButtonIndex: 1,
    }, (buttonIndex) => {
      if (buttonIndex === 0) {
        handlePressEdit()
      } else if (buttonIndex === 1) {
        handlePressDelete()
      }
    })
  }

  if (!cookbook) return null

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} style={$root}>
      {isAuthor && (
        <MoreButton 
          onPress={handlePressMore}
        />
      )}
      <ListView<RecipeBrief>
        data={recipeStore.recipes?.items?.slice() ?? []}
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
          <View>
            <View style={$headerContainer}>
              <Text preset="heading" text={cookbook.title} />
            </View>
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
              $listItemStyle,
              index === 0 && $borderTop,
              index === recipeStore.recipes?.items?.length - 1 && $borderBottom,
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

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
}

const $title: ViewStyle = {
  marginBottom: spacing.md,
}

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

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: spacing.xl,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.xl,
}

const $right: TextStyle = {
  textAlign: "right",
}

const $listItemStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  marginHorizontal: spacing.lg,
}

const $root: ViewStyle = {
  flex: 1,
}

