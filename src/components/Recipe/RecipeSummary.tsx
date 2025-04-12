import React from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "src/components"
import { spacing, colors } from "src/theme"
import { Recipe } from "src/models/Recipe"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { observer } from "mobx-react-lite"

const $titleContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: theme.spacing.sm,
})

const $subtitleContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: theme.spacing.sm,
})

const $detailsContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-evenly",
  backgroundColor: theme.colors.tintInactive,
  borderRadius: theme.spacing.md,
  borderColor: theme.colors.border,
  borderWidth: theme.spacing.xxxs,
  margin: theme.spacing.sm,
  padding: theme.spacing.md,
})

const $descriptionContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "column",
  alignItems: "flex-start",
  marginHorizontal: theme.spacing.sm,
})

export interface RecipeSummaryProps {
  recipe: Recipe
}

export default observer(function RecipeSummary({ recipe }: RecipeSummaryProps) {
  const { themed } = useAppTheme()
  const hasImages = !!recipe?.images[0]

  const $themedTitleContainer = React.useMemo(() => themed($titleContainer), [themed])
  const $themedSubtitleContainer = React.useMemo(() => themed($subtitleContainer), [themed])
  const $themedDetailsContainer = React.useMemo(() => themed($detailsContainer), [themed])
  const $themedDescriptionContainer = React.useMemo(() => themed($descriptionContainer), [themed])

  return (
    <View>
      <View style={$themedTitleContainer}>
        <Text
          preset="heading"
          weight="normal"
          text={recipe.title}
          style={{ marginTop: hasImages ? 0 : spacing.xxxl }}
        />
      </View>

      <View style={$themedSubtitleContainer}>
        <Text preset="subheading" weight="light" text={recipe.author ?? ""} />
      </View>

      <View style={$themedDetailsContainer}>
        {!!recipe.servings && (
          <View>
            <Text weight="light" tx={"recipeDetailsScreen:servings"} />
            <Text preset="heading" weight="light" text={`${recipe.servings}pp`} />
          </View>
        )}

        {!!recipe.bakingTimeInMinutes && (
          <View>
            <Text weight="light" tx={"recipeDetailsScreen:bake"} />
            <Text preset="heading" weight="light" text={`${recipe.bakingTimeInMinutes}m`} />
          </View>
        )}

        {!!recipe.preparationTimeInMinutes && (
          <View>
            <Text weight="light" tx={"recipeDetailsScreen:prep"} />
            <Text preset="heading" weight="light" text={`${recipe.preparationTimeInMinutes}m`} />
          </View>
        )}

        {!!recipe.cookingTimeInMinutes && (
          <View>
            <Text weight="light" tx={"recipeDetailsScreen:cook"} />
            <Text preset="heading" weight="light" text={`${recipe.cookingTimeInMinutes}m`} />
          </View>
        )}
      </View>

      {!!recipe.summary && (
        <View style={$themedDescriptionContainer}>
          <Text preset="subheading" tx={"recipeDetailsScreen:summary"} />
          <Text preset="default" text={recipe.summary ?? ""} />
        </View>
      )}
    </View>
  )
})
