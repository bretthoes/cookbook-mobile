import { useStores } from "app/models"
import React, { FC, useEffect, useState } from "react"
import { isRTL, translate } from "../../i18n"
import { delay } from "../../utils/delay"
import { observer } from "mobx-react-lite"
import { EmptyState, ListItem, ListView, Screen, Text, PaginationControls, SearchBar } from "../../components"
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
import { DrawerIconButton } from "../DemoShowroomScreen/DrawerIconButton"
import { Drawer } from "react-native-drawer-layout"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "app/navigators"
import { RecipeListItem } from "./RecipeListItem"
import { DemoDivider } from "../DemoShowroomScreen/DemoDivider"

const logo = require("../../../assets/images/logo.png")

interface CookbookDetailsScreenProps extends AppStackScreenProps<"CookbookDetails"> {}

export const CookbookDetailsScreen: FC<CookbookDetailsScreenProps> = observer(function CookbookDetailsScreen() {
  const { recipeStore, cookbookStore } = useStores()
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const navigation = useNavigation<AppStackScreenProps<"CookbookDetails">["navigation"]>()
  
  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await recipeStore.fetchRecipes(cookbookStore.currentCookbook?.id ?? 0)
      setIsLoading(false)
    })()
  }, [recipeStore])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([
      recipeStore.fetchRecipes(cookbookStore.currentCookbook?.id ?? 0, recipeStore.recipes?.pageNumber),
      delay(750),
    ])
    setRefreshing(false)
  }

  // Filter the recipes based on the search query
  const filteredRecipes =
    recipeStore.recipes?.items
      .slice()
      .filter((recipe) => recipe.title.toLowerCase().includes(searchQuery.toLowerCase())) ?? []

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
    if (recipeStore.recipes?.hasNextPage) {
      setIsLoading(true)
      await recipeStore.fetchRecipes(
        cookbookStore.currentCookbook?.id ?? 0,
        recipeStore.recipes.pageNumber + 1,
      )
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (recipeStore.recipes?.hasPreviousPage) {
      setIsLoading(true)
      await recipeStore.fetchRecipes(
        cookbookStore.currentCookbook?.id ?? 0,
        recipeStore.recipes.pageNumber - 1,
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
          <ListItem
            text={translate("recipeListScreen.add")}
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleAddRecipe}
          />
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
          data={filteredRecipes}
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
                <Text preset="heading" text={cookbookStore.currentCookbook?.title} />
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
                index === filteredRecipes.length - 1 && $borderBottom,
              ]}
            >
              <RecipeListItem
                recipe={item}
                index={index}
                lastIndex={filteredRecipes.length - 1}
              />
            </View>
          )}
        />
        {recipeStore.recipes?.hasMultiplePages && (
          <PaginationControls
            currentPage={recipeStore.recipes?.pageNumber}
            totalPages={recipeStore.recipes?.totalPages}
            totalCount={recipeStore.recipes?.totalCount}
            hasNextPage={recipeStore.recipes?.hasNextPage}
            hasPreviousPage={recipeStore.recipes?.hasPreviousPage}
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
// #endregion
