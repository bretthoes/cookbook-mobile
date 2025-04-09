import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, ViewStyle, Alert, TouchableOpacity } from "react-native"
import { spacing } from "src/theme"
import { ListItem, ListView, Screen, Text } from "src/components"
import { RecipeImages } from "src/components/Recipe/RecipeImages"
import { RecipeIngredient } from "src/models/Recipe"
import { RecipeDirection } from "src/models/Recipe/RecipeDirection"
import { RecipeSummary } from "src/components/Recipe/RecipeSummary"
import { useStores } from "src/models/helpers/useStores"
import { router } from "expo-router"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { MoreButton } from "src/components/MoreButton"
import { CustomBackButton } from "src/components/CustomBackButton"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { ItemNotFound } from "src/components/ItemNotFound"
import { DirectionText } from "src/components/Recipe/DirectionText"
import { IngredientItem } from "src/components/Recipe/IngredientItem"

export default observer(function Recipe() {
  const {
    cookbookStore: { selected: cookbook },
    recipeStore: { selected, delete: deleteRecipe },
    membershipStore: { email, fetchEmail },
  } = useStores()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()
  const isRecipeAuthor =
  selected?.authorEmail?.toLowerCase() === (email && email?.toLowerCase()) && !!email
  const ownsCookbook = cookbook?.authorEmail?.toLowerCase() === (email && email?.toLowerCase()) && !!email
  const canEdit = isRecipeAuthor || ownsCookbook
  const recipeHasImages = selected?.images[0]

  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedDirectionsContainer = React.useMemo(() => themed($directionsContainer), [themed])
  const $themedIngredientsContainer = React.useMemo(() => themed($ingredientsContainer), [themed])

  const handlePressEdit = () => {
    router.push(`/recipe/${selected?.id}/edit`)
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

  if (!selected) return <ItemNotFound message="Recipe not found" />

  return (
    <Screen safeAreaEdges={recipeHasImages ? [] : ["top"]} preset="scroll">
      <CustomBackButton
        onPress={() => router.back()}
        top={recipeHasImages ? spacing.xl : spacing.sm}
      />
      {canEdit && (
        <MoreButton onPress={handlePressMore} top={recipeHasImages ? spacing.xl : spacing.sm} />
      )}
      {selected?.images && <RecipeImages data={selected?.images} />}
      {selected && (
        <RecipeSummary recipe={selected} />
      )}

      {selected && (
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
                <IngredientItem
                  ingredient={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === selected!.ingredients.length - 1}
                />
              )
            }
            data={selected?.ingredients}
            estimatedItemSize={59}
            contentContainerStyle={$themedIngredientsContainer}
            ListEmptyComponent={<View />}
          ></ListView>
        </View>
      )}

      {selected && (
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
                    index === selected!.directions.length - 1 && $themedBorderBottom,
                  ]}
                >
                  <ListItem
                    style={{ padding: spacing.sm }}
                    LeftComponent={
                      <DirectionText ordinal={item?.ordinal} text={item?.text} />
                    }
                    height={spacing.xl}
                    bottomSeparator={index !== selected!.directions.length - 1}
                    topSeparator={index !== 0}
                  />
                </View>
              )
            }
            data={selected?.directions}
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
  paddingTop: theme.spacing.lg,
  paddingBottom: theme.spacing.lg,
})

// #endregion
