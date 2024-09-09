import React, { FC, useEffect, useState } from "react"
import { useStores } from "../models"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, ImageStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { Drawer } from "react-native-drawer-layout"
import { Image } from "react-native"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { delay } from "app/utils/delay"
import { DrawerIconButton } from "./DemoShowroomScreen/DrawerIconButton"
import { ListItem, ListView, Screen, Text } from "../components"
import { Slide } from "app/components/Slide"
import { RecipeIngredient } from "app/models/RecipeIngredient"
import { RecipeDirection } from "app/models/RecipeDirection"

const logo = require("../../assets/images/logo.png")

export const RecipeDetailsScreen: FC<DemoTabScreenProps<"RecipeDetails">> = observer(
  function RecipeDetailsScreen(_props) {
    const { recipeStore } = useStores()
    const [open, setOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // initially, kick off a background refresh without the refreshing UI
    useEffect(() => {
      ;(async function load() {
        setIsLoading(true)
        await recipeStore.fetchRecipe(_props.route.params.recipeId)
        setIsLoading(false)
      })()
    }, [recipeStore])

    // simulate a longer refresh, if the refresh is too fast for UX
    async function manualRefresh() {
      setRefreshing(true)
      await Promise.all([recipeStore.fetchRecipe(_props.route.params.recipeId), delay(750)])
      setRefreshing(false)
    }

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
          preset="scroll"
          contentContainerStyle={$screenContentContainer}
        >
          
          {recipeStore.currentRecipe?.images && (
            <Slide data={recipeStore.currentRecipe?.images} />
          )}

          <View style={$titleContainer}>
            <Text preset="heading" weight="normal" text={recipeStore.currentRecipe?.title} />
            <DrawerIconButton onPress={toggleDrawer} />
          </View>

          <View style={$subtitleContainer}>
            <Text preset="subheading" weight="light" text={recipeStore.currentRecipe?.author ?? ''} />
          </View>

          <View style={$detailsContainer}>
            {recipeStore.currentRecipe?.servings && (
              <View>
                <Text weight="light" text="Servings" />
                <Text preset="heading" weight="light" text={`${recipeStore.currentRecipe?.servings}pp`} />
              </View>
            )}
            {recipeStore.currentRecipe?.bakingTimeInMinutes && (
              <View>
                <Text weight="light" text="Bake Time" />
                <Text preset="heading" weight="light" text={`${recipeStore.currentRecipe?.bakingTimeInMinutes}m`} />
              </View>
            )}
            {recipeStore.currentRecipe?.preparationTimeInMinutes && (
              <View>
                <Text weight="light" text="Prep Time" />
                <Text preset="heading" weight="light" text={`${recipeStore.currentRecipe?.preparationTimeInMinutes}m`} />
              </View>
            )}
            {recipeStore.currentRecipe?.cookingTimeInMinutes && (
              <View>
                <Text weight="light" text="Cook Time:" />
                <Text preset="heading" weight="light" text={`${recipeStore.currentRecipe?.cookingTimeInMinutes}m`} />
              </View>
            )}
          </View>

          {recipeStore.currentRecipe?.summary && (
            <View style={$descriptionContainer}>
              <Text weight="light" text="Description" />
              <Text weight="light" text={recipeStore.currentRecipe?.summary ?? ""} />
            </View>
          )}

          <View style={{minHeight: spacing.xxs}}>
            <ListView<RecipeIngredient>
              ListHeaderComponent={
                <Text weight="light" text="Ingredients" style={{ paddingBottom: spacing.md }} />
              }
              renderItem={({item, index}) => (
                <View style={[
                  $listItemStyle,
                  index === 0 && $borderTop,
                  index === recipeStore.currentRecipe?.ingredients!.length! - 1 && $borderBottom
                ]}>
                  <ListItem text={`- ${item.name}`} />
                </View>
              )}
              data={recipeStore.currentRecipe?.ingredients}
              estimatedItemSize={59}
              contentContainerStyle={$ingredientsContainer}
              ListEmptyComponent={
                isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <View />
                )
              }
              >
            </ListView>
          </View>

          <View style={{minHeight: spacing.xxs }}>
            <ListView<RecipeDirection>
              ListHeaderComponent={
                <Text weight="light" text="Directions" style={{ paddingBottom: spacing.md }}  />
              }
              renderItem={({item, index}) => (
                <View style={[
                  $listItemStyle,
                  index === 0 && $borderTop,
                  index === recipeStore.currentRecipe?.directions!.length! - 1 && $borderBottom
                ]}>
                  <ListItem text={`${item.ordinal}. ${item.text}`} />
                </View>
              )}
              data={recipeStore.currentRecipe?.directions}
              estimatedItemSize={59}
              contentContainerStyle={$directionsContainer}
              ListEmptyComponent={
                isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <View />
                )
              }
              >
            </ListView>
          </View>
        </Screen>
      </Drawer>
    )
  },
)

// #region Styles

const $screenContentContainer: ViewStyle = {
}

const $listItemStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  marginHorizontal: spacing.sm,
}

const $borderTop: ViewStyle = {
  borderTopLeftRadius: spacing.xs,
  borderTopRightRadius: spacing.xs,
}

const $borderBottom: ViewStyle = {
  borderBottomLeftRadius: spacing.xs,
  borderBottomRightRadius: spacing.xs,
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

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginHorizontal: spacing.sm,
}

const $subtitleContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginHorizontal: spacing.sm,
}

const $descriptionContainer: ViewStyle = {
  flexDirection: "column",
  alignItems: "flex-start",
  marginHorizontal: spacing.sm,
}

const $detailsContainer: ViewStyle = {
  flexDirection: "row",
  borderColor: colors.palette.neutral400,
  borderWidth: spacing.xxxs,
  alignItems: "center",
  justifyContent: "space-evenly",
  backgroundColor: colors.palette.neutral300,
  borderRadius: spacing.md,
  margin: spacing.sm,
  padding: spacing.md,
}

const $directionsContainer: ViewStyle = {
  padding: spacing.md,
}

const $ingredientsContainer: ViewStyle = {
  padding: spacing.md
}

// #endregion
