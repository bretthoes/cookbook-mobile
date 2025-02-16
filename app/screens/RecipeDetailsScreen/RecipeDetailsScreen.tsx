import { AppStackScreenProps } from "app/navigators"
import React, { FC, useEffect, useState } from "react"
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
    const { 
      recipeStore: {
        currentRecipe,
        deleteRecipe
      },
      membershipStore: {
        email,
        fetchEmail 
      }
    }
      = useStores()

    const [open, setOpen] = useState(false)

    const toggleDrawer = () => {
      setOpen(!open)
    }

    const navigation = useNavigation<AppStackScreenProps<"CookbookDetails">["navigation"]>()

    // TODO make sure this doesn't hit api every time a recipe is opened
    useEffect(() => {
      fetchEmail()
    }, [])

    const isAuthor = currentRecipe?.author?.toLowerCase === (email && email?.toLowerCase)

    const handleEditRecipe = () => {
      navigation.navigate("EditRecipe")
      toggleDrawer()
    }

    const handleDeleteRecipe = () => {
      deleteRecipe()
      navigation.replace("CookbookDetails")
      toggleDrawer()
    }

    const recipeHasImages = currentRecipe?.images[0]

    return (
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="back"
        drawerPosition={"right"}
        renderDrawerContent={() => (
            <RecipeDrawer 
              handleEditRecipe={handleEditRecipe} 
              handleDeleteRecipe={handleDeleteRecipe} 
              isAuthor={isAuthor}
            />
        )}
      >
        <Screen safeAreaEdges={recipeHasImages ? [] : ["top"]} preset="scroll">
          {currentRecipe?.images && (
            <RecipeImages data={currentRecipe?.images} />
          )}

          {currentRecipe && (
            <RecipeSummary recipe={currentRecipe} toggleDrawer={toggleDrawer} />
          )}

          {currentRecipe && (
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
                        index === currentRecipe!.ingredients.length - 1 &&
                          $borderBottom,
                      ]}
                    >
                      <CustomListItem
                        text={` - ${item?.name}`}
                        index={index}
                        lastIndex={currentRecipe!.ingredients.length - 1}
                        height={spacing.xl}
                      />
                    </View>
                  )
                }
                data={currentRecipe?.ingredients}
                estimatedItemSize={59}
                contentContainerStyle={$ingredientsContainer}
                ListEmptyComponent={<View />}
              ></ListView>
            </View>
          )}

          {currentRecipe && (
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
                        index === currentRecipe!.directions.length - 1 && $borderBottom,
                      ]}
                    >
                      <CustomListItem
                        text={`${item?.ordinal}. ${item?.text}`}
                        index={index}
                        lastIndex={currentRecipe!.directions.length - 1}
                        height={spacing.xl}
                      />
                    </View>
                  )
                }
                data={currentRecipe?.directions}
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
