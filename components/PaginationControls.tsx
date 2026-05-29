import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { Button } from "./Button"
import { Icon } from "./Icon"

export interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onNextPage: () => void
  onPreviousPage: () => void
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}

export function PaginationControls(props: PaginationControlsProps) {
  const {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    onNextPage,
    onPreviousPage,
    style,
  } = props
  const { themed, theme } = useAppTheme()

  return (
    <View style={[themed($root), style]}>
      <Button
        onPress={onPreviousPage}
        disabled={!hasPreviousPage}
        RightAccessory={() => (
          <Icon
            icon="caretLeft"
            color={hasPreviousPage ? theme.colors.text : theme.colors.separator}
          />
        )}
      ></Button>
      <Text
        tx="common:paginationLabel"
        txOptions={{ currentPage, totalPages, totalCount }}
        style={themed($text)}
      />
      <Button
        onPress={onNextPage}
        disabled={!hasNextPage}
        RightAccessory={() => (
          <Icon icon="caretRight" color={hasNextPage ? theme.colors.text : theme.colors.separator} />
        )}
      />
    </View>
  )
}

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  padding: theme.spacing.md,
  alignItems: "center",
})

const $text: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.icon,
})
