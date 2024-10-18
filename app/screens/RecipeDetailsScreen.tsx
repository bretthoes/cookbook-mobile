import { AppStackScreenProps } from "app/navigators"
import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { Drawer } from "react-native-drawer-layout"
import { delay } from "app/utils/delay"
import { ListView, Screen, Text } from "../components"
import { RecipeImages } from "app/screens/RecipeDetailsScreen/RecipeImages"
import { RecipeIngredient } from "app/models/RecipeIngredient"
import { RecipeDirection } from "app/models/RecipeDirection"
import { CustomListItem } from "./RecipeDetailsScreen/CustomListItem"
import { RecipeDrawer } from "./RecipeDetailsScreen/RecipeDrawer"
import { RecipeSummary } from "./RecipeDetailsScreen/RecipeSummary"
 import { useNavigation } from "@react-navigation/native"
 import { useStores } from "app/models"

interface RecipeDetailsScreenProps extends AppStackScreenProps<"RecipeDetails"> {}

export const RecipeDetailsScreen: FC<RecipeDetailsScreenProps> = observer(function RecipeDetailsScreen() {
  // Pull in one of our MST stores
  const { recipeStore } = useStores()
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const toggleDrawer = () => {
    setOpen(!open)
  }

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await recipeStore.fetchRecipe(1)
      setIsLoading(false)
    })()
  }, [recipeStore])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([recipeStore.fetchRecipe(1), delay(750)])
    setRefreshing(false)
  }

  // Pull in navigation via hook
   const navigation = useNavigation()
   return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerType="back"
      drawerPosition={"right"}
      renderDrawerContent={() => <RecipeDrawer />}
    >
      <Screen safeAreaEdges={recipeStore.currentRecipe?.images[0] ? [] : ["top"]} preset="scroll">
        {recipeStore.currentRecipe?.images && (
          <RecipeImages data={recipeStore.currentRecipe?.images} />
        )}

        {recipeStore.currentRecipe && (
          <RecipeSummary recipe={recipeStore.currentRecipe} toggleDrawer={toggleDrawer} />
        )}

        {recipeStore.currentRecipe && (
          <View style={{ minHeight: spacing.xxs }}>
            <ListView<RecipeIngredient>
              onRefresh={manualRefresh}
              refreshing={refreshing}
              ListHeaderComponent={
                <Text
                  weight="light"
                  tx="recipeDetailsScreen.ingredients"
                  style={{ paddingBottom: spacing.md }}
                />
              }
              renderItem={({ item, index }) =>
                item && (
                  <View
                    style={[
                      $ingredientItemStyle,
                      index === 0 && $borderTop,
                      index === recipeStore.currentRecipe!.ingredients.length - 1 &&
                        $borderBottom,
                    ]}
                  >
                    <CustomListItem
                      text={` - ${item?.name}`}
                      index={index}
                      lastIndex={recipeStore.currentRecipe!.ingredients.length - 1}
                      height={spacing.xl}
                    />
                  </View>
                )
              }
              data={recipeStore.currentRecipe?.ingredients}
              estimatedItemSize={59}
              contentContainerStyle={$ingredientsContainer}
              ListEmptyComponent={isLoading ? <ActivityIndicator /> : <View />}
            ></ListView>
          </View>
        )}

        {recipeStore.currentRecipe && (
          <View style={{ minHeight: spacing.xxs }}>
            <ListView<RecipeDirection>
              onRefresh={manualRefresh}
              refreshing={refreshing}
              ListHeaderComponent={
                <Text
                  weight="light"
                  tx="recipeDetailsScreen.directions"
                  style={{ paddingBottom: spacing.md }}
                />
              }
              renderItem={({ item, index }) =>
                item && (
                  <View
                    style={[
                      $listItemStyle,
                      index === 0 && $borderTop,
                      index === recipeStore.currentRecipe!.directions.length - 1 && $borderBottom,
                    ]}
                  >
                    <CustomListItem
                      text={`${item?.ordinal}. ${item?.text}`}
                      index={index}
                      lastIndex={recipeStore.currentRecipe!.directions.length - 1}
                      height={spacing.xl}
                    />
                  </View>
                )
              }
              data={recipeStore.currentRecipe?.directions}
              estimatedItemSize={59}
              contentContainerStyle={$directionsContainer}
              ListEmptyComponent={isLoading ? <ActivityIndicator /> : <View />}
            ></ListView>
          </View>
        )}
      </Screen>
    </Drawer>
  )
},
)

// #region Styles

const $ingredientItemStyle: ViewStyle = {
backgroundColor: colors.palette.neutral100,
paddingHorizontal: spacing.md,
}

const $listItemStyle: ViewStyle = {
backgroundColor: colors.palette.neutral100,
paddingHorizontal: spacing.md,
}

const $borderTop: ViewStyle = {
borderTopLeftRadius: spacing.xs,
borderTopRightRadius: spacing.xs,
}

const $borderBottom: ViewStyle = {
borderBottomLeftRadius: spacing.xs,
borderBottomRightRadius: spacing.xs,
}

const $directionsContainer: ViewStyle = {
padding: spacing.md,
}

const $ingredientsContainer: ViewStyle = {
padding: spacing.md,
}

// #endregion
