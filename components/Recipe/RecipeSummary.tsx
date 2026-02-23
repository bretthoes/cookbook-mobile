import { Text } from "@/components/Text"
import { translate } from "@/i18n"
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

const MAX_SUMMARY_LENGTH = 200

function formatMinutes(minutes: number): { hours: number; minutes: number } {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return { hours, minutes: mins }
}

function TimeDisplay({ minutes }: { minutes: number }) {
  const { hours, minutes: mins } = formatMinutes(minutes)
  return (
    <>
      {hours > 0 && (
        <Text
          preset="default"
          text={`${hours} ${hours !== 1 ? translate("recipeSummary:hour_plural") : translate("recipeSummary:hour")}`}
        />
      )}
      {mins > 0 && (
        <Text preset="default" text={`${mins} ${translate("recipeSummary:mins")}`} />
      )}
    </>
  )
}

const $timeItemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  justifyContent: "flex-start",
})

export default observer(function RecipeSummary({ recipe }: RecipeSummaryProps) {
  const { themed } = useAppTheme()
  const [isExpanded, setIsExpanded] = React.useState(false)
  const hasImages = !!recipe?.images[0]
  const hasTimeOrServings =
    !!recipe.servings ||
    !!recipe.preparationTimeInMinutes ||
    !!recipe.bakingTimeInMinutes ||
    !!recipe.cookingTimeInMinutes

  const summary = recipe.summary ?? ""
  const shouldTruncate = summary.length > MAX_SUMMARY_LENGTH
  const displaySummary =
    isExpanded || !shouldTruncate ? summary : summary.substring(0, MAX_SUMMARY_LENGTH) + "..."

  const $themedTitleContainer = React.useMemo(() => themed($titleContainer), [themed])
  const $themedSubtitleContainer = React.useMemo(() => themed($subtitleContainer), [themed])
  const $themedDetailsContainer = React.useMemo(() => themed($detailsContainer), [themed])
  const $themedTimeItemContainer = React.useMemo(() => themed($timeItemContainer), [themed])

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
              <Text preset="subheading" weight="light" tx={"recipeDetailsScreen:servings"} />
              <Text
                preset="heading"
                weight="light"
                text={`${recipe.servings}${translate("recipeSummary:servingsSuffix")}`}
              />
            </View>
          )}

          {!!recipe.bakingTimeInMinutes && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={translate("recipeDetailsScreen:bake").toUpperCase()}
              />
              <TimeDisplay minutes={recipe.bakingTimeInMinutes} />
            </View>
          )}

          {!!recipe.preparationTimeInMinutes && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={translate("recipeDetailsScreen:prep").toUpperCase()}
              />
              <TimeDisplay minutes={recipe.preparationTimeInMinutes} />
            </View>
          )}

          {!!recipe.cookingTimeInMinutes && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={translate("recipeDetailsScreen:cook").toUpperCase()}
              />
              <TimeDisplay minutes={recipe.cookingTimeInMinutes} />
            </View>
          )}
        </View>
      )}

      {!!recipe.summary && (
        <UseCase tx="recipeDetailsScreen:summary">
          <Text preset="default" text={displaySummary} />
          {shouldTruncate && (
            <Text
              weight="light"
              tx={isExpanded ? "recipeSummary:showLess" : "recipeSummary:showMore"}
              onPress={() => setIsExpanded(!isExpanded)}
              style={{ marginTop: spacing.sm, alignSelf: "flex-end" }}
            />
          )}
        </UseCase>
      )}
    </View>
  )
})
