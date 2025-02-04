import { AppStackScreenProps } from "app/navigators"
import React, { FC, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { Drawer } from "react-native-drawer-layout"
import { ListView, Screen, Text } from "../../components"
import { RecipeImages } from "app/screens/RecipeDetailsScreen/RecipeImages"
import { RecipeIngredient } from "app/models/RecipeIngredient"
import { RecipeDirection } from "app/models/RecipeDirection"
import { CustomListItem } from "./CustomListItem"
import { RecipeDrawer } from "./RecipeDrawer"
import { RecipeSummary } from "./RecipeSummary"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"

interface RecipeDetailsScreenProps extends AppStackScreenProps<"RecipeDetails"> {}

export const RecipeDetailsScreen: FC<RecipeDetailsScreenProps> = observer(
  function RecipeDetailsScreen() {
    // Pull in one of our MST stores
    const { recipeStore } = useStores()
    const [open, setOpen] = useState(false)
    const toggleDrawer = () => {
      setOpen(!open)
    }
    const navigation = useNavigation<AppStackScreenProps<"CookbookDetails">["navigation"]>()

    const handleEditRecipe = () => {
      navigation.navigate("AddRecipe")
      toggleDrawer()
    }

    return (
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="back"
        drawerPosition={"right"}
        renderDrawerContent={() => <RecipeDrawer handleEditRecipe={handleEditRecipe} />}
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
                ListEmptyComponent={<View />}
              ></ListView>
            </View>
          )}

          {recipeStore.currentRecipe && (
            <View style={{ minHeight: spacing.xxs }}>
              <ListView<RecipeDirection>
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
                ListEmptyComponent={<View />}
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
