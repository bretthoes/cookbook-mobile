import React from "react"
import { observer } from "mobx-react-lite"
import { RecipeBrief } from "src/models/Recipe"
import { TextStyle } from "react-native"
import { typography } from "src/theme"
import { ListItem } from "../ListItem"

export const RecipeListItem = observer(function RecipeListItem({
  recipe,
  index,
  lastIndex,
  onPress,
}: {
  recipe: RecipeBrief
  index: number
  lastIndex: number
  onPress: () => void
}) {
  return (
    <ListItem
      onPress={onPress}
      text={recipe.title}
      rightIcon="caretRight"
      TextProps={{ numberOfLines: 3, size: "md" }} // TODO customizable font size
      topSeparator
      bottomSeparator={index === lastIndex}
    />
  )
})
