import { Text } from "@/components/Text"
import { Recipe } from "@/models/Recipe"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import React from "react"
import { View, ViewStyle } from "react-native"
import { UseCase } from "../UseCase"

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

export interface RecipeSummaryProps {
  recipe: Recipe
}

export default observer(function RecipeSummary({ recipe }: RecipeSummaryProps) {
  const { themed } = useAppTheme()
  const hasImages = !!recipe?.images[0]
  const hasTimeOrServings =
    !!recipe.servings ||
    !!recipe.preparationTimeInMinutes ||
    !!recipe.bakingTimeInMinutes ||
    !!recipe.cookingTimeInMinutes

  const $themedTitleContainer = React.useMemo(() => themed($titleContainer), [themed])
  const $themedSubtitleContainer = React.useMemo(() => themed($subtitleContainer), [themed])
  const $themedDetailsContainer = React.useMemo(() => themed($detailsContainer), [themed])

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

      {hasTimeOrServings && (
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
      )}

      {!!recipe.summary && (
        <UseCase tx="recipeDetailsScreen:summary">
          <Text preset="default" text={recipe.summary ?? ""} />
        </UseCase>
      )}
    </View>
  )
})
