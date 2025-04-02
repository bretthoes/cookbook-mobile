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
import { RecipeBrief } from "src/models/Recipe"
import { isRTL, translate } from "src/i18n"
import { useDebounce } from "src/models/helpers/useDebounce"
import { RecipeListItem } from "src/components/Recipe/RecipeListItem"
import { PaginationControls } from "src/components/PaginationControls"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useHeader } from "src/utils/useHeader"

export default observer(function Cookbook() {
  const {
    cookbookStore,
    recipeStore,
    membershipStore,
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showActionSheetWithOptions } = useActionSheet()

  const cookbook = cookbookStore.cookbooks.find((c) => c.id === Number(id))
  const isAuthor = cookbook?.authorEmail?.toLowerCase() === membershipStore.email?.toLowerCase() && !!membershipStore.email

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      await membershipStore.fetchEmail()
      await membershipStore.single(cookbook?.id ?? 0)
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

  useHeader({
    title: cookbook?.title ?? "",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightIcon: "more",
    onRightPress: () => handlePressMore(),
  })

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
    if (!isAuthor) return
    router.push(`/cookbook/${id}/edit` as Href<`/cookbook/${string}/edit`>)
  }

  const handlePressLeave = async () => {
    // TODO should refresh current cookbook here to ensure membersCount is up to date.
    if (isAuthor && cookbook?.membersCount !== 1) {
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
            console.log("Leaving cookbook", membershipStore.ownMembership?.id)
            if (!membershipStore.ownMembership?.id) return
              var result = await membershipStore.delete(membershipStore.ownMembership?.id)
              if (result) {
                router.back()
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

  if (!cookbook) return null

  return (
    <Screen preset="scroll" style={$root}>
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
  backgroundColor: colors.backgroundDim,
  paddingHorizontal: spacing.md,
  marginHorizontal: spacing.lg,
}

const $root: ViewStyle = {
  flex: 1,
}
