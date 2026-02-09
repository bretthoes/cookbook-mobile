import { ListItem } from "@/components/ListItem"
import { TextProps } from "@/components/Text"
import { observer } from "mobx-react-lite"
import React from "react"

export const RecipeListItem = observer(function RecipeListItem({
  text,
  index,
  lastIndex,
  onPress,
  TextProps: textPropsOverride,
}: {
  text: string
  index: number
  lastIndex: number
  onPress: () => void
  TextProps?: TextProps
}) {
  // No styles to theme in this component, but we're adding the hook for consistency
  // and in case styles are added in the future

  const defaultTextProps: TextProps = { numberOfLines: 3, size: "md" }
  const mergedTextProps: TextProps = textPropsOverride
    ? { ...defaultTextProps, ...textPropsOverride }
    : defaultTextProps

  return (
    <ListItem
      onPress={onPress}
      text={text}
      rightIcon="caretRight"
      TextProps={mergedTextProps} // TODO customizable font size
      topSeparator
      bottomSeparator={index === lastIndex}
    />
  )
})
