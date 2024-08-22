import React, { FC, useEffect, useState } from "react"
import { isRTL, translate } from "../i18n"
import { useStores } from "../models"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { delay } from "../utils/delay"
import { observer } from "mobx-react-lite"
import { EmptyState, Icon, ListItem, ListView, Screen, Toggle } from "../components"
import { ActivityIndicator, Animated, ImageStyle, TextInput, TextStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { Recipe } from "app/models/Recipe"
import { Text } from "../components"
import { DrawerIconButton } from "./DemoShowroomScreen/DrawerIconButton"
import { Drawer } from "react-native-drawer-layout"
import { Image } from "react-native"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"

const logo = require("../../assets/images/logo.png")

export const RecipeListScreen: FC<DemoTabScreenProps<"RecipeList">> = observer(
  function CookbookDetailScreen(_props) {
    const { recipeStore } = useStores()
    const [open, setOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // initially, kick off a background refresh without the refreshing UI
    useEffect(() => {
      ;(async function load() {
        setIsLoading(true)
        await recipeStore.fetchRecipes(_props.route.params.cookbookId)
        setIsLoading(false)
      })()
    }, [recipeStore])

    // simulate a longer refresh, if the refresh is too fast for UX
    async function manualRefresh() {
      setRefreshing(true)
      await Promise.all([recipeStore.fetchRecipes(_props.route.params.cookbookId), delay(750)])
      setRefreshing(false)
    }

    // Filter the recipes based on the search query
    const filteredRecipes = recipeStore.recipesForList
      .slice()
      .filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    const toggleDrawer = () => {
      setOpen(!open)
    }

    const $drawerInsets = useSafeAreaInsetsStyle(["top"])

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
          </View>
        )}
      >
        <Screen
          preset="fixed"
          safeAreaEdges={["top"]}
          contentContainerStyle={$screenContentContainer}
        >
          <View style={$headerContainer}>
            <Text preset="heading" tx="recipeListScreen.title" />
            <DrawerIconButton onPress={toggleDrawer} />
          </View>
          <View style={$listStyle}>
            <ListView<Recipe>
              data={filteredRecipes}
              estimatedItemSize={59}
              ListEmptyComponent={
                isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <EmptyState
                    preset="generic"
                    style={$emptyState}
                    headingTx={
                      recipeStore.favoritesOnly
                        ? "cookbookListScreen.noFavoritesEmptyState.heading"
                        : undefined
                    }
                    contentTx={
                      recipeStore.favoritesOnly
                        ? "cookbookListScreen.noFavoritesEmptyState.content"
                        : undefined
                    }
                    button={recipeStore.favoritesOnly ? "" : undefined}
                    buttonOnPress={manualRefresh}
                    imageStyle={$emptyStateImage}
                    ImageProps={{ resizeMode: "contain" }}
                  />
                )
              }
              ListHeaderComponent={
                <View>
                  <View style={$searchContainer}>
                    <TextInput
                      style={$searchBar}
                      placeholder={translate("recipeListScreen.searchPlaceholder")}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor={colors.palette.neutral400}
                    />
                    <Animated.View style={[$searchIcon]}>
                      <Icon
                        icon="debug"
                        size={20}
                        color={colors.palette.neutral600}
                      />
                    </Animated.View>
                  </View>
                  {(recipeStore.favoritesOnly || recipeStore.recipesForList.length > 0) && (
                    <View style={$toggle}>
                      <Toggle
                        value={recipeStore.favoritesOnly}
                        onValueChange={() =>
                          recipeStore.setProp("favoritesOnly", !recipeStore.favoritesOnly)
                        }
                        variant="switch"
                        labelTx="cookbookListScreen.onlyFavorites"
                        labelPosition="left"
                        labelStyle={$labelStyle}
                        accessibilityLabel={translate("cookbookListScreen.accessibility.switch")}
                      />
                    </View>
                  )}
                </View>
              }
              onRefresh={manualRefresh}
              refreshing={refreshing}
              renderItem={({ item, index }) => (
                <ListItem
                  style={$listItemStyle}
                  text={item.title}
                  rightIcon="caretRight"
                  TextProps={{ numberOfLines: 1 }}
                  topSeparator={index !== 0}
                />
              )}
            />
          </View>
        </Screen>
      </Drawer>
    )
  },
)

// #region Styles

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: spacing.xl,
  paddingHorizontal: spacing.md,
}

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $listStyle: ViewStyle = {
  flex: 1,
  backgroundColor: colors.palette.neutral200,
}

const $listItemStyle: ViewStyle = {
  paddingHorizontal: spacing.xs,
}

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $toggle: ViewStyle = {
  marginVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
}

const $searchContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.sm,
  marginHorizontal: spacing.xs,
  borderColor: colors.palette.neutral500,
  borderWidth: 1,
  borderRadius: spacing.xs,
  backgroundColor: colors.palette.neutral100,
}

const $searchBar: TextStyle = {
  flex: 1,
  paddingVertical: spacing.sm,
  color: colors.palette.neutral800,
}

const $searchIcon: ViewStyle = {
  marginLeft: spacing.sm,
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