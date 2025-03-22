import React from "react"
import { observer } from "mobx-react-lite"
import { ListItem } from "../ListItem"

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
