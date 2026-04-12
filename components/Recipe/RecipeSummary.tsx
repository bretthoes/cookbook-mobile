import { Text } from "@/components/Text"
import { Recipe } from "@/models/Recipe"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { TextStyle, View, ViewStyle } from "react-native"
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
  marginVertical: theme.spacing.sm,
  marginHorizontal: theme.spacing.xs,
  paddingVertical: theme.spacing.md,
  paddingHorizontal: 0,
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
  const { t } = useTranslation()
  const { hours, minutes: mins } = formatMinutes(minutes)
  return (
    <>
      {hours > 0 && (
        <Text
          preset="default"
          text={`${hours} ${hours !== 1 ? t("recipeSummary:hour_plural") : t("recipeSummary:hour")}`}
        />
      )}
      {mins > 0 && <Text preset="default" text={`${mins} ${t("recipeSummary:mins")}`} />}
    </>
  )
}

const $timeItemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  justifyContent: "flex-start",
})

const $separatorBeforeTags: ThemedStyle<ViewStyle> = (theme) => ({
  height: 1,
  backgroundColor: theme.colors.separator,
  marginHorizontal: theme.spacing.sm,
  marginTop: theme.spacing.md,
  marginBottom: theme.spacing.sm,
})

const $tagsRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
  marginHorizontal: spacing.sm,
  marginBottom: spacing.xs,
}

const $tagChip: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 1,
  borderColor: theme.colors.tint,
  borderRadius: theme.spacing.xl,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
  backgroundColor: theme.colors.tint,
})

const $tagChipText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
  fontSize: 13,
})

type TagKey =
  | "isVegetarian"
  | "isVegan"
  | "isGlutenFree"
  | "isDairyFree"
  | "isCheap"
  | "isHealthy"
  | "isLowFodmap"
  | "isHighProtein"
  | "isBreakfast"
  | "isLunch"
  | "isDinner"
  | "isDessert"
  | "isSnack"

const RECIPE_TAGS: { key: TagKey; labelTx: Parameters<typeof Text>[0]["tx"] }[] = [
  { key: "isVegetarian", labelTx: "recipeTags:isVegetarian" },
  { key: "isVegan", labelTx: "recipeTags:isVegan" },
  { key: "isGlutenFree", labelTx: "recipeTags:isGlutenFree" },
  { key: "isDairyFree", labelTx: "recipeTags:isDairyFree" },
  { key: "isCheap", labelTx: "recipeTags:isCheap" },
  { key: "isHealthy", labelTx: "recipeTags:isHealthy" },
  { key: "isLowFodmap", labelTx: "recipeTags:isLowFodmap" },
  { key: "isHighProtein", labelTx: "recipeTags:isHighProtein" },
  { key: "isBreakfast", labelTx: "recipeTags:isBreakfast" },
  { key: "isLunch", labelTx: "recipeTags:isLunch" },
  { key: "isDinner", labelTx: "recipeTags:isDinner" },
  { key: "isDessert", labelTx: "recipeTags:isDessert" },
  { key: "isSnack", labelTx: "recipeTags:isSnack" },
]

export default observer(function RecipeSummary({ recipe }: RecipeSummaryProps) {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
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

      {RECIPE_TAGS.some(({ key }) => recipe[key] === true) && (
        <>
          <View style={themed($separatorBeforeTags)} />
          <View style={$tagsRow}>
            {RECIPE_TAGS.filter(({ key }) => recipe[key] === true).map(({ key, labelTx }) => (
              <View key={key} style={themed($tagChip)}>
                <Text tx={labelTx} style={themed($tagChipText)} />
              </View>
            ))}
          </View>
        </>
      )}

      {hasTimeOrServings && (
        <View style={$themedDetailsContainer}>
          {!!recipe.servings && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={t("recipeDetailsScreen:servings").toUpperCase()}
              />
              <Text
                preset="heading"
                weight="light"
                text={`${recipe.servings}`}
              />
            </View>
          )}

          {!!recipe.bakingTimeInMinutes && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={t("recipeDetailsScreen:bake").toUpperCase()}
              />
              <TimeDisplay minutes={recipe.bakingTimeInMinutes} />
            </View>
          )}

          {!!recipe.preparationTimeInMinutes && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={t("recipeDetailsScreen:prep").toUpperCase()}
              />
              <TimeDisplay minutes={recipe.preparationTimeInMinutes} />
            </View>
          )}

          {!!recipe.cookingTimeInMinutes && (
            <View style={$themedTimeItemContainer}>
              <Text
                preset="formHelper"
                weight="light"
                text={t("recipeDetailsScreen:cook").toUpperCase()}
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
