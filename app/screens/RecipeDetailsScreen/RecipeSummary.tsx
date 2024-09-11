import React from 'react'
import { View, ViewStyle } from 'react-native'
import { Text } from '../../components'
import { spacing, colors } from 'app/theme'
import { Recipe } from 'app/models/Recipe'

export interface RecipeSummaryProps {
  recipe: Recipe
}

export const RecipeSummary = ({ recipe }: RecipeSummaryProps) => (
  <View>
    <View style={$titleContainer}>
      <Text preset="heading" weight="normal" text={recipe.title} />
    </View>

    <View style={$subtitleContainer}>
      <Text preset="subheading" weight="light" text={recipe.author ?? ''} />
    </View>

    <View style={$detailsContainer}>
      {recipe.servings && <Text weight="light" text={`Servings: ${recipe.servings}pp`} />}
      {recipe.bakingTimeInMinutes && <Text weight="light" text={`Bake Time: ${recipe.bakingTimeInMinutes}m`} />}
      {recipe.preparationTimeInMinutes && <Text weight="light" text={`Prep Time: ${recipe.preparationTimeInMinutes}m`} />}
      {recipe.cookingTimeInMinutes && <Text weight="light" text={`Cook Time: ${recipe.cookingTimeInMinutes}m`} />}
    </View>
  </View>
)

const $titleContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginHorizontal: spacing.sm,
}

const $subtitleContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginHorizontal: spacing.sm,
}

const $detailsContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  backgroundColor: colors.palette.neutral300,
  borderRadius: spacing.md,
  margin: spacing.sm,
  padding: spacing.md,
}
