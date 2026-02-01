import { CustomBackButton } from "@/components/CustomBackButton"
import { Divider } from "@/components/Divider"
import { ItemNotFound } from "@/components/ItemNotFound"
import { ListItem } from "@/components/ListItem"
import { MoreButton } from "@/components/MoreButton"
import { DirectionText } from "@/components/Recipe/DirectionText"
import { IngredientItem } from "@/components/Recipe/IngredientItem"
import { RecipeImages } from "@/components/Recipe/RecipeImages"
import RecipeSummary from "@/components/Recipe/RecipeSummary"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { ActivityIndicator, Alert, View, ViewStyle } from "react-native"

export default observer(function Recipe() {
  const {
    recipeStore: { selected, delete: deleteRecipe, single },
    membershipStore: { ownMembership },
  } = useStores()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()
  const [isLoading, setIsLoading] = useState(false)
  const isRecipeAuthor =
    ownMembership?.email?.toLowerCase() === selected?.authorEmail?.toLowerCase() &&
    !!ownMembership?.email
  const canEdit = isRecipeAuthor || ownMembership?.isOwner || ownMembership?.canUpdateRecipe
  const canDelete = ownMembership?.canDeleteRecipe
  const recipeHasImages = selected?.images[0]

  const $themedListItemStyle = React.useMemo(() => themed($listItemStyle), [themed])
  const $themedBorderTop = React.useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = React.useMemo(() => themed($borderBottom), [themed])
  const $themedDirectionsContainer = React.useMemo(() => themed($directionsContainer), [themed])
  const $themedIngredientsContainer = React.useMemo(() => themed($ingredientsContainer), [themed])

  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {
      await single(Number(id))
    }
    fetchData()
    setIsLoading(false)
  }, [id, single])

  const handlePressEdit = () => {
    router.push(`../recipe/${selected?.id}/edit`)
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
          },
        },
      ],
    )
  }

  const handlePressMore = () => {
    const options = canEdit
      ? ["Edit Recipe", "Delete Recipe", "Cancel"]
      : ["Delete Recipe", "Cancel"]
    const cancelButtonIndex = options.length - 1
    const destructiveButtonIndex = options.indexOf("Delete Recipe")

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return

        if (buttonIndex === 0 && canEdit) {
          handlePressEdit()
        } else if (buttonIndex === (canDelete ? 1 : 0)) {
          handlePressDelete()
        }
      },
    )
  }

  if (!selected && !isLoading)
    return (
      <>
        <Divider size={spacing.xxxl} />
        <ItemNotFound message="Recipe not found" />
      </>
    )

  return isLoading ? (
    <ActivityIndicator />
  ) : (
    <Screen safeAreaEdges={recipeHasImages ? [] : ["top"]} preset="scroll">
      <CustomBackButton
        onPress={() => router.back()}
        top={recipeHasImages ? spacing.xl : spacing.sm} // TODO check both recipeHasImages AND the image loaded properly... We get warnings when there's a size issue (image loaded from URL but is way too big) or its found but the file is 0kb etc
      />
      {canEdit && (
        <MoreButton onPress={handlePressMore} top={recipeHasImages ? spacing.xl : spacing.sm} />
      )}
      {selected?.images && <RecipeImages data={selected?.images} />}
      {selected && <RecipeSummary recipe={selected} />}

      {selected && (
        <View style={$themedIngredientsContainer}>
          <Text
            preset="subheading"
            tx="recipeDetailsScreen:ingredients"
            style={{ paddingBottom: spacing.md }}
          />
          {selected.ingredients.map((item, index) => (
            <IngredientItem
              key={index}
              ingredient={item}
              index={index}
              isFirst={index === 0}
              isLast={index === selected.ingredients.length - 1}
            />
          ))}
        </View>
      )}

      {selected && (
        <View style={$themedDirectionsContainer}>
          <Text
            preset="subheading"
            tx="recipeDetailsScreen:directions"
            style={{ paddingBottom: spacing.md }}
          />
          {selected.directions.map((item, index) => (
            <View
              key={index}
              style={[
                $themedListItemStyle,
                index === 0 && $themedBorderTop,
                index === selected.directions.length - 1 && $themedBorderBottom,
              ]}
            >
              <ListItem
                style={{ padding: spacing.sm }}
                LeftComponent={<DirectionText ordinal={item?.ordinal} text={item?.text} />}
                height={spacing.xl}
                bottomSeparator={index !== selected.directions.length - 1}
                topSeparator={index !== 0}
              />
            </View>
          ))}
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
