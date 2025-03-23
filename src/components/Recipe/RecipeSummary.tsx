import React from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "src/components"
import { spacing, colors } from "src/theme"
import { Recipe } from "src/models/Recipe"
import { TxKeyPath } from "src/i18n"

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginHorizontal: spacing.sm,
}

const $subtitleContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginHorizontal: spacing.sm,
}

const $detailsContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-evenly",
  backgroundColor: colors.palette.neutral300,
  borderRadius: spacing.md,
  borderColor: colors.palette.neutral400,
  borderWidth: spacing.xxxs,
  margin: spacing.sm,
  padding: spacing.md,
}

const $descriptionContainer: ViewStyle = {
  flexDirection: "column",
  alignItems: "flex-start",
  marginHorizontal: spacing.sm,
}

export interface RecipeSummaryProps {
  recipe: Recipe
  hasImages?: boolean
}

export function RecipeSummary({ recipe, hasImages }: RecipeSummaryProps) {
  return (
    <View>
      <View style={$titleContainer}>
        <Text 
          preset="heading" 
          weight="normal" 
          text={recipe.title} 
          style={{ marginTop: hasImages ? 0 : spacing.xxxl }} 
        />
      </View>

      <View style={$subtitleContainer}>
        <Text preset="subheading" weight="light" text={recipe.author ?? ""} />
      </View>

      <View style={$detailsContainer}>
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
        <View style={$descriptionContainer}>
          <Text weight="light" tx={"recipeDetailsScreen:summary"} />
          <Text weight="light" text={recipe.summary ?? ""} />
        </View>
      )}
    </View>
  )
}
