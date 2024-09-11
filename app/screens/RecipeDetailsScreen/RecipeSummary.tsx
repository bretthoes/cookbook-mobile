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
      {recipe.servings && (
        <View>
          <Text weight="light" text="Servings" />
          <Text preset="heading" weight="light" text={`${recipe.servings}pp`} />
        </View>
      )}

      {recipe.bakingTimeInMinutes && (
        <View>
          <Text weight="light" text="Bake Time" />
          <Text preset="heading" weight="light" text={`${recipe.bakingTimeInMinutes}m`} />
        </View>
      )}

      {recipe.preparationTimeInMinutes && (
        <View>
          <Text weight="light" text="Prep Time" />
          <Text preset="heading" weight="light" text={`${recipe.preparationTimeInMinutes}m`} />
        </View>
      )}
      
      {recipe.cookingTimeInMinutes && (
        <View>
          <Text weight="light" text="Cook Time:" />
          <Text preset="heading" weight="light" text={`${recipe.cookingTimeInMinutes}m`} />
        </View>
      )}
    </View>

    {recipe.summary && (
      <View style={$descriptionContainer}>
        <Text weight="light" text="Description" />
        <Text weight="light" text={recipe.summary ?? ""} />
      </View>
    )}
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

const $descriptionContainer: ViewStyle = {
  flexDirection: "column",
  alignItems: "flex-start",
  marginHorizontal: spacing.sm,
}