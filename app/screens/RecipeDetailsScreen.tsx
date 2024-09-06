import React, { FC, useEffect, useState } from "react"
import { useStores } from "../models"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import { ImageStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { Drawer } from "react-native-drawer-layout"
import { Image } from "react-native"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { delay } from "app/utils/delay"
import { DrawerIconButton } from "./DemoShowroomScreen/DrawerIconButton"
import { Icon, Screen, Text } from "../components"
import { Slide } from "app/components/Slide"

const logo = require("../../assets/images/logo.png")

export const RecipeDetailsScreen: FC<DemoTabScreenProps<"RecipeDetails">> = observer(
  function RecipeListScreen(_props) {
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
          preset="fixed"
          safeAreaEdges={["top"]}
          contentContainerStyle={$screenContentContainer}
        >
          <View style={$headerContainer}>
            <DrawerIconButton onPress={toggleDrawer} />
          </View>

          {recipeStore.currentRecipe?.images && (
            <Slide data={recipeStore.currentRecipe?.images} />
          )}

          <View style={$titleContainer}>
            <Text preset="heading" weight="normal" text={recipeStore.currentRecipe?.title} />
            <Icon
              icon="heart"
              size={32}
              color={colors.palette.primary400}
            />
          </View>

          <View style={$subtitleContainer}>
            <Text preset="subheading" weight="light" text={recipeStore.currentRecipe?.author ?? ''} />
          </View>

          {recipeStore.currentRecipe?.summary && (
            <View style={$descriptionContainer}>
              <Text weight="light" text="Description" />
              <Text weight="light" text={recipeStore.currentRecipe?.summary ?? ""} />
            </View>
          )}

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
        </Screen>
      </Drawer>
    )
  },
)

// #region Styles

const $screenContentContainer: ViewStyle = {
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

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "flex-end",
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
  alignItems: "center",
  justifyContent: "space-evenly",
  backgroundColor: colors.palette.neutral300,
  borderRadius: spacing.md,
  margin: spacing.sm,
  padding: spacing.md,
}

// #endregion
