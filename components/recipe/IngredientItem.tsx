import { Text } from "@/components/Text"
import { Checkbox } from "@/components/Toggle"
import type { RecipeIngredient } from "@/types/recipe"
import type { ThemedStyle } from "@/theme"
import { useThemedStyles } from "@/theme/useThemedStyles"
import React, { useState } from "react"
import { Pressable, View, ViewStyle } from "react-native"

interface IngredientItemProps {
  ingredient: RecipeIngredient
  index: number
  isFirst: boolean
  isLast: boolean
}

export const IngredientItem = ({ ingredient, index, isFirst, isLast }: IngredientItemProps) => {
  const [isChecked, setIsChecked] = useState(false)
  

  const $themedContainer = useThemedStyles($container)
  const $themedCheckboxContainer = useThemedStyles($checkboxContainer)
  const $themedTextContainer = useThemedStyles($textContainer)
  const $themedItemStyle = useThemedStyles($itemStyle)
  const $themedBorderTop = useThemedStyles($borderTop)
  const $themedBorderBottom = useThemedStyles($borderBottom)
  const $themedSeparator = useThemedStyles($separator)

  const handleValueChange = (value: boolean) => {
    setIsChecked(value)
  }

  return (
    <View style={[$themedItemStyle, isFirst && $themedBorderTop, isLast && $themedBorderBottom]}>
      <Pressable style={$themedContainer} onPress={() => handleValueChange(!isChecked)}>
        <View style={$themedCheckboxContainer} pointerEvents="none">
          <Checkbox value={isChecked} onValueChange={handleValueChange} />
        </View>
        <View style={$themedTextContainer}>
          <Text size="md">{ingredient.name}</Text>
        </View>
      </Pressable>
      {!isLast && <View style={$themedSeparator} />}
    </View>
  )
}

// Styles specific to this component
const $itemStyle: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  paddingHorizontal: theme.spacing.md,
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
})

const $checkboxContainer: ThemedStyle<ViewStyle> = (theme) => ({
  marginRight: theme.spacing.sm,
})

const $textContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
})

const $borderTop: ThemedStyle<ViewStyle> = (theme) => ({
  borderTopLeftRadius: theme.spacing.xs,
  borderTopRightRadius: theme.spacing.xs,
})

const $borderBottom: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomLeftRadius: theme.spacing.xs,
  borderBottomRightRadius: theme.spacing.xs,
})

const $separator: ThemedStyle<ViewStyle> = (theme) => ({
  height: 1,
  backgroundColor: theme.colors.border,
  marginHorizontal: theme.spacing.sm,
})
