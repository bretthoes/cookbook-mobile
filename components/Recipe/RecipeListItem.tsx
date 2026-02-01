import { ListItem } from "@/components/ListItem"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import React from "react"

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
