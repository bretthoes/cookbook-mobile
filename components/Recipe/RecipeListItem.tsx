import { Icon } from "@/components/Icon"
import { ListItem } from "@/components/ListItem"
import { Text, TextProps } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import React from "react"
import { TextStyle, View, ViewStyle } from "react-native"

export const RecipeListItem = observer(function RecipeListItem({
  text,
  index,
  lastIndex,
  onPress,
  TextProps: textPropsOverride,
  isOwner,
}: {
  text: string
  index: number
  lastIndex: number
  onPress: () => void
  TextProps?: TextProps
  isOwner?: boolean
}) {
  const { themed, theme } = useAppTheme()

  const defaultTextProps: TextProps = { numberOfLines: 3, size: "md" }
  const mergedTextProps: TextProps = textPropsOverride
    ? { ...defaultTextProps, ...textPropsOverride }
    : defaultTextProps

  return (
    <ListItem
      onPress={onPress}
      CenterComponent={
        <View style={themed($nameRow)}>
          <Text
            {...mergedTextProps}
            text={text}
            style={[mergedTextProps.style, themed($nameText)]}
          />
          {isOwner ? (
            <Icon
              icon="crown"
              size={18}
              color={theme.colors.tint}
              containerStyle={themed($crownIcon)}
            />
          ) : null}
        </View>
      }
      rightIcon="caretRight"
      topSeparator
      bottomSeparator={index === lastIndex}
    />
  )
})

const $nameRow: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  flexGrow: 1,
  flexShrink: 1,
  paddingVertical: spacing.xs,
})

const $nameText: ThemedStyle<TextStyle> = () => ({
  flexShrink: 1,
})

const $crownIcon: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
})
