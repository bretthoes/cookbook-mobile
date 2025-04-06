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
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { ItemNotFound } from "src/components/ItemNotFound"

export default observer(function Recipe() {
  const {
    cookbookStore: { currentCookbook },
    recipeStore: { currentRecipe, deleteRecipe },
    membershipStore: { email, fetchEmail },
  } = useStores()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()
  const isRecipeAuthor =
    currentRecipe?.authorEmail?.toLowerCase() === (email && email?.toLowerCase()) && !!email
  const ownsCookbook = currentCookbook?.authorEmail?.toLowerCase() === (email && email?.toLowerCase()) && !!email
  const canEdit = isRecipeAuthor || ownsCookbook
  const recipeHasImages = currentRecipe?.images[0]

  const $themedIngredientItemStyle = React.useMemo(() => themed($ingredientItemStyle), [themed])
  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedDirectionsContainer = React.useMemo(() => themed($directionsContainer), [themed])
  const $themedIngredientsContainer = React.useMemo(() => themed($ingredientsContainer), [themed])

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
    const options = ["Edit Recipe", "Delete Recipe", "Cancel"]

    const cancelButtonIndex = options.length - 1

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
          destructiveButtonIndex: 1,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return

        if (buttonIndex === 0) {
          handlePressEdit()
        } else if (buttonIndex === 1) {
          handlePressDelete()
        }
      },
    )
  }

  // TODO instead of fetching this here, fetch it when we login and store email in secure storage
  useEffect(() => {
    const fetchData = async () => {
      await fetchEmail()
    }
    fetchData()
  }, [])

  if (!currentRecipe) return <ItemNotFound message="Recipe not found" />

  return (
    <Screen safeAreaEdges={recipeHasImages ? [] : ["top"]} preset="scroll">
      <CustomBackButton
        onPress={() => router.back()}
        top={recipeHasImages ? spacing.xl : spacing.sm}
      />
      {canEdit && (
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
                preset="subheading"
                tx="recipeDetailsScreen:ingredients"
                style={{ paddingBottom: spacing.md }}
              />
            }
            renderItem={({ item, index }) =>
              item && (
                <View
                  style={[
                    $themedIngredientItemStyle,
                    index === 0 && $themedBorderTop,
                    index === currentRecipe!.ingredients.length - 1 && $themedBorderBottom,
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
            contentContainerStyle={$themedIngredientsContainer}
            ListEmptyComponent={<View />}
          ></ListView>
        </View>
      )}

      {currentRecipe && (
        <View style={{ minHeight: spacing.xxs }}>
          <ListView<RecipeDirection>
            ListHeaderComponent={
              <Text
                preset="subheading"
                tx="recipeDetailsScreen:directions"
                style={{ paddingBottom: spacing.md }}
              />
            }
            renderItem={({ item, index }) =>
              item && (
                <View
                  style={[
                    $themedListItemStyle,
                    index === 0 && $themedBorderTop,
                    index === currentRecipe!.directions.length - 1 && $themedBorderBottom,
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
            contentContainerStyle={$themedDirectionsContainer}
            ListEmptyComponent={<View />}
          ></ListView>
        </View>
      )}
    </Screen>
  )
})

// #region Styles

const $ingredientItemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  paddingHorizontal: theme.spacing.md,
})

const $listItemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  paddingHorizontal: theme.spacing.md,
})

const $borderTop: ThemedStyle<ViewStyle> = (theme) => ({
  borderTopLeftRadius: theme.spacing.xs,
  borderTopRightRadius: theme.spacing.xs,
})

const $borderBottom: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomLeftRadius: theme.spacing.xs,
  borderBottomRightRadius: theme.spacing.xs,
})

const $directionsContainer: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
})

const $ingredientsContainer: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
})

// #endregion
