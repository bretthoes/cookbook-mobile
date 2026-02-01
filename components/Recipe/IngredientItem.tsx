import { Text } from "@/components/Text"
import { Checkbox } from "@/components/Toggle"
import { RecipeIngredient } from "@/models/Recipe"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import React, { useMemo, useState } from "react"
import { View, ViewStyle } from "react-native"

interface IngredientItemProps {
  ingredient: RecipeIngredient
  index: number
  isFirst: boolean
  isLast: boolean
}

export const IngredientItem = ({ ingredient, index, isFirst, isLast }: IngredientItemProps) => {
  const [isChecked, setIsChecked] = useState(false)
  const { themed } = useAppTheme()

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedCheckboxContainer = useMemo(() => themed($checkboxContainer), [themed])
  const $themedTextContainer = useMemo(() => themed($textContainer), [themed])
  const $themedItemStyle = useMemo(() => themed($itemStyle), [themed])
  const $themedBorderTop = useMemo(() => themed($borderTop), [themed])
  const $themedBorderBottom = useMemo(() => themed($borderBottom), [themed])
  const $themedSeparator = useMemo(() => themed($separator), [themed])

  const handleValueChange = (value: boolean) => {
    setIsChecked(value)
  }

  return (
    <View style={[$themedItemStyle, isFirst && $themedBorderTop, isLast && $themedBorderBottom]}>
      <View style={$themedContainer}>
        <View style={$themedCheckboxContainer}>
          <Checkbox value={isChecked} onValueChange={handleValueChange} />
        </View>
        <View style={$themedTextContainer}>
          <Text size="md">{ingredient.name}</Text>
        </View>
      </View>
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
