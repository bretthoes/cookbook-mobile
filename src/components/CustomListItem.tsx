import { ListItem } from "src/components"

interface CustomListItemProps {
  text: string
  index: number
  lastIndex: number
  height: number
}

export function CustomListItem(props: CustomListItemProps) {
  const { text, index, lastIndex, height } = props

  const handlePressItem = () => {
    // strikethrough
  }

  return (
    <ListItem
      onPress={handlePressItem}
      text={text}
      topSeparator={index > 0}
      bottomSeparator={index !== lastIndex}
      TextProps={{ size: "md" }}
      height={height}
    />
  )
}
