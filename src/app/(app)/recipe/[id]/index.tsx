import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Alert } from "react-native"
import { colors, spacing } from "src/theme"
import { ListView, Screen, Text } from "src/components"
import { RecipeImages } from "src/components/Recipe/RecipeImages"
import { RecipeIngredient } from "src/models/Recipe"
import { RecipeDirection } from "src/models/Recipe/RecipeDirection"
import { CustomListItem } from "src/components/CustomListItem"
import { RecipeSummary } from "src/components/Recipe/RecipeSummary"
import { useStores } from "src/models/helpers/useStores"
import { router } from "expo-router"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { MoreButton } from "src/components/MoreButton"
import { CustomBackButton } from "src/components/CustomBackButton"

export default observer(function Recipe() {
  console.log("Recipe")
  // Pull in one of our MST stores
  const {
    recipeStore: { currentRecipe, deleteRecipe },
    membershipStore: { email, fetchEmail },
  } = useStores()
  const { showActionSheetWithOptions } = useActionSheet()
  const isAuthor =
    currentRecipe?.authorEmail?.toLowerCase() === (email && email?.toLowerCase()) && !!email

  const recipeHasImages = currentRecipe?.images[0]

  const handlePressEdit = () => {
    router.push(`/recipe/${currentRecipe?.id}/edit`)
  }

  const handlePressDelete = async () => {
    Alert.alert(
      "Delete Recipe",
      "Are you sure you want to delete this recipe? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteRecipe()
            router.back()
          },
        },
      ],
    )
  }

  const handlePressMore = () => {
    let options = []
    if (isAuthor) {
      options = ["Edit Recipe", "Delete Recipe", "Go back to cookbook", "Cancel"]
    } else {
      options = ["Go back to cookbook", "Cancel"]
    }

    const cancelButtonIndex = options.length - 1

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex: isAuthor ? 1 : undefined,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return

        if (isAuthor) {
          if (buttonIndex === 0) {
            handlePressEdit()
          } else if (buttonIndex === 1) {
            handlePressDelete()
          } else if (buttonIndex === 2) {
            router.back()
          }
        } else {
          if (buttonIndex === 0) {
            router.back()
          }
        }
      },
    )
  }

  // TODO instead of fetching this here, fetch it when we login and store email in secure storage
  useEffect(() => {
    fetchEmail()
  }, [])

  return (
    <Screen safeAreaEdges={recipeHasImages ? [] : ["top"]} preset="scroll">
      <CustomBackButton
        onPress={() => router.back()}
        top={recipeHasImages ? spacing.xl : spacing.sm}
      />
      {isAuthor && (
        <MoreButton onPress={handlePressMore} top={recipeHasImages ? spacing.xl : spacing.sm} />
      )}
      {currentRecipe?.images && <RecipeImages data={currentRecipe?.images} />}
      {currentRecipe && (
        <RecipeSummary recipe={currentRecipe} hasImages={!!currentRecipe?.images[0]} />
      )}

      {currentRecipe && (
        <View style={{ minHeight: spacing.xxs }}>
          <ListView<RecipeIngredient>
            ListHeaderComponent={
              <Text
                weight="light"
                tx="recipeDetailsScreen:ingredients"
                style={{ paddingBottom: spacing.md }}
              />
            }
            renderItem={({ item, index }) =>
              item && (
                <View
                  style={[
                    $ingredientItemStyle,
                    index === 0 && $borderTop,
                    index === currentRecipe!.ingredients.length - 1 && $borderBottom,
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
                tx="recipeDetailsScreen:directions"
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
  )
})

// #region Styles

const $ingredientItemStyle: ViewStyle = {
  backgroundColor: colors.backgroundDim,
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
