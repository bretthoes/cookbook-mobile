import { ListItem } from "app/components"
import { observer } from "mobx-react-lite"

export const CustomListItem = observer(function CustomListItem({
  text,
  index,
  lastIndex,
  height,
}: {
  text: string
  index: number
  lastIndex: number
  height: number
}) {
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
})
