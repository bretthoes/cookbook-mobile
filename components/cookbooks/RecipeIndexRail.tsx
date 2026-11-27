import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { useThemedStyles } from "@/theme/useThemedStyles"
import { useTranslation } from "react-i18next"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

type RecipeIndexRailProps = {
  sections: { title: string }[]
  highlightedSection: string | null
  onJump: (sectionIndex: number) => void
}

export function RecipeIndexRail({ sections, highlightedSection, onJump }: RecipeIndexRailProps) {
  const { t } = useTranslation()
  const $themedIndexRail = useThemedStyles($indexRail)
  const $themedRailLetter = useThemedStyles($railLetter)
  const $themedRailLetterActive = useThemedStyles($railLetterActive)

  return (
    <View style={$themedIndexRail} pointerEvents="box-none">
      {sections.map((section, index) => {
        const selected = section.title === highlightedSection
        return (
          <TouchableOpacity
            key={section.title}
            accessibilityRole="button"
            accessibilityLabel={t("cookbookDetailScreen:jumpToSection", {
              letter: section.title,
            })}
            accessibilityState={{ selected }}
            hitSlop={{ left: 8, right: 8 }}
            onPress={() => onJump(index)}
          >
            <Text
              text={section.title}
              size="xxs"
              style={selected ? $themedRailLetterActive : $themedRailLetter}
            />
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const $indexRail: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: theme.spacing.xs,
  bottom: theme.spacing.xs,
  end: 0,
  width: theme.spacing.lg,
  justifyContent: "center",
  alignItems: "center",
})

const $railLetter: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.tint,
  fontFamily: theme.typography.secondary.medium,
  fontSize: 11,
  lineHeight: 14,
  textAlign: "center",
})

const $railLetterActive: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  fontFamily: theme.typography.secondary.medium,
  fontSize: 11,
  lineHeight: 14,
  textAlign: "center",
})
