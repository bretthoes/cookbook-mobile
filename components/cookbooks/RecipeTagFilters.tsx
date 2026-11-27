import { Text } from "@/components/Text"
import {
  getRecipeTagChipColor,
  RECIPE_TAG_CHIP_TEXT_COLOR,
} from "@/components/recipe/recipeTagColors"
import type { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { TouchableOpacity, View, ViewStyle } from "react-native"

export const RECIPE_TAG_KEYS = [
  "isVegetarian",
  "isVegan",
  "isGlutenFree",
  "isDairyFree",
  "isHealthy",
  "isCheap",
  "isLowFodmap",
  "isHighProtein",
  "isBreakfast",
  "isLunch",
  "isDinner",
  "isDessert",
  "isSnack",
] as const

export type RecipeTagKey = (typeof RECIPE_TAG_KEYS)[number]

function tagLabelTx(tag: RecipeTagKey): TxKeyPath {
  return `cookbookDetailScreen:tags.${tag}` as TxKeyPath
}

type RecipeTagFiltersProps = {
  selectedTags: Set<RecipeTagKey>
  onToggle: (tag: RecipeTagKey) => void
}

export function RecipeTagFilters({ selectedTags, onToggle }: RecipeTagFiltersProps) {
  const { themed } = useAppTheme()

  return (
    <View style={themed($tagChipContainer)}>
      {RECIPE_TAG_KEYS.map((tag) => {
        const isSelected = selectedTags.has(tag)
        const chipColor = isSelected ? getRecipeTagChipColor(tag) : undefined
        return (
          <TouchableOpacity
            key={tag}
            onPress={() => onToggle(tag)}
            style={[
              themed($tagChip),
              chipColor && {
                backgroundColor: chipColor,
                borderColor: chipColor,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text
              size="xs"
              weight={isSelected ? "semiBold" : "normal"}
              tx={tagLabelTx(tag)}
              style={chipColor ? { color: RECIPE_TAG_CHIP_TEXT_COLOR } : undefined}
            />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const $tagChipContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: theme.spacing.xs,
  paddingHorizontal: theme.spacing.sm,
  paddingTop: theme.spacing.xs,
  paddingBottom: theme.spacing.sm,
  marginHorizontal: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  borderBottomLeftRadius: theme.spacing.xs,
  borderBottomRightRadius: theme.spacing.xs,
})

const $tagChip: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xxs,
  borderRadius: theme.spacing.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.background,
})
