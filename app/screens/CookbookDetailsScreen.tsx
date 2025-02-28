import { useStores } from "app/models"
import React, { FC, useEffect, useState } from "react"
import { isRTL, translate } from "../i18n"
import { delay } from "../utils/delay"
import { observer } from "mobx-react-lite"
import { EmptyState, ListItem, ListView, Screen, Text, PaginationControls, SearchBar } from "../components"
import {
  ActivityIndicator,
  ImageStyle,
  TextStyle,
  View,
  ViewStyle,
  Image,
} from "react-native"
import { colors, spacing } from "app/theme"
import { RecipeBrief } from "app/models/Recipe"
import { DrawerIconButton } from "../components/DrawerIconButton"
import { Drawer } from "react-native-drawer-layout"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "app/navigators"
import { RecipeListItem } from "../components/RecipeListItem"
import { DemoDivider } from "../components/DemoDivider"
import { useDebounce } from "app/models/generics/UseDebounce"

const logo = require("../../assets/images/logo.png")

interface CookbookDetailsScreenProps extends AppStackScreenProps<"CookbookDetails"> {}

export const CookbookDetailsScreen: FC<CookbookDetailsScreenProps> = observer(function CookbookDetailsScreen() {
  const {
    recipeStore: {
      fetchRecipes,
      recipes
    },
    cookbookStore:
    {
      currentCookbook
    }
  } = useStores()
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigation = useNavigation<AppStackScreenProps<"CookbookDetails">["navigation"]>()
  const debouncedSearchQuery = useDebounce(searchQuery)
  const cookbookId = currentCookbook?.id ?? 0
  
  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await fetchRecipes(cookbookId)
      setIsLoading(false)
    })()
  }, [fetchRecipes])

  // Fetch recipes when debounced search query changes
  useEffect(() => {
    console.log("debounce")
    fetchRecipes(cookbookId, debouncedSearchQuery)
  }, [debouncedSearchQuery, fetchRecipes, cookbookId])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([
      fetchRecipes(cookbookId,
        searchQuery,
        recipes.pageNumber),
      delay(750),
    ])
    setRefreshing(false)
  }

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const $drawerInsets = useSafeAreaInsetsStyle(["top"])

  const handleAddRecipe = () => {
    navigation.navigate("AddRecipe")
    toggleDrawer()
  }

  const handleInvite = () => { 
    navigation.navigate("AddInvite")
    toggleDrawer() 
  }

  const handleLeave = () => { toggleDrawer() }

  const handleNextPage = async () => {
    if (recipes.hasNextPage) {
      setIsLoading(true)
      await fetchRecipes(
        cookbookId,
        searchQuery,
        recipes.pageNumber + 1,
      )
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (recipes.hasPreviousPage) {
      setIsLoading(true)
      await fetchRecipes(
        cookbookId,
        searchQuery,
        recipes.pageNumber - 1,
      )
      setIsLoading(false)
    }
  }

  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerType="back"
      drawerPosition={"right"}
      renderDrawerContent={() => (
        <View style={[$drawer, $drawerInsets]}>
          <View style={$logoContainer}>
            <Image source={logo} style={$logoImage} />
          </View>
          <Text preset="subheading" text="Add new recipe" style={$sectionHeader} />
          <ListItem
            text="Add recipe manually"
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleAddRecipe}
          />
          <ListItem
            text="Add recipe from camera"
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleAddRecipe}
          />
          <ListItem
            text="Add recipe from website"
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleAddRecipe}
          />
          <Text preset="subheading" text="Other options" style={$sectionHeader} />
          <ListItem
            text={translate("recipeListScreen.invite")}
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleInvite}
          />
          <ListItem
            text={translate("recipeListScreen.leave")}
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleLeave}
          />
        </View>
      )}
    >
      <Screen
        preset="scroll"
        safeAreaEdges={["top"]}
        contentContainerStyle={$root}
      >
        <ListView<RecipeBrief>
          data={recipes?.items?.slice() ?? []}
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
                <Text preset="heading" text={currentCookbook?.title} />
                <DrawerIconButton onPress={toggleDrawer} />
              </View>
              <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={translate("recipeListScreen.searchPlaceholder")}
              />
              <DemoDivider size={spacing.sm} />
            </View>
          }
          onRefresh={manualRefresh}
          refreshing={refreshing}
          renderItem={({ item, index }) => (
            <View
              style={[
                $listItemStyle,
                index === 0 && $borderTop,
                index === recipes.items.length - 1 && $borderBottom,
              ]}
            >
              <RecipeListItem
                recipe={item}
                index={index}
                lastIndex={recipes.items.length - 1}
              />
            </View>
          )}
        />
        {recipes.hasMultiplePages && (
          <PaginationControls
            currentPage={recipes.pageNumber}
            totalPages={recipes.totalPages}
            totalCount={recipes.totalCount}
            hasNextPage={recipes.hasNextPage}
            hasPreviousPage={recipes.hasPreviousPage}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        )}
      </Screen>
    </Drawer>
  )
})

// #region Styles
const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
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

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-end",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}

const $sectionHeader: TextStyle = {
  paddingHorizontal: spacing.lg,
  textAlign: "right",
  paddingVertical: spacing.sm,
}
// #endregion
