import React from "react"
import { observer } from "mobx-react-lite"
import { ListItem } from "../ListItem"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

export const RecipeListItem = observer(function RecipeListItem({
  text,
  index,
  lastIndex,
  onPress,
}: {
  text: string
  index: number
  lastIndex: number
  onPress: () => void
}) {
  const { themed } = useAppTheme()

  // No styles to theme in this component, but we're adding the hook for consistency
  // and in case styles are added in the future

  return (
    <ListItem
      onPress={onPress}
      text={text}
      rightIcon="caretRight"
      TextProps={{ numberOfLines: 3, size: "md" }} // TODO customizable font size
      topSeparator
      bottomSeparator={index === lastIndex}
    />
  )
})
