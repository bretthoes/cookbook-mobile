import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "src/theme"
import { Text } from "src/components/Text"
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
  } = props

  return (
    <View style={$root}>
      <Button
        onPress={onPreviousPage}
        disabled={!hasPreviousPage}
        RightAccessory={() => (
          <Icon
            icon="caretLeft"
            color={hasPreviousPage ? colors.palette.neutral900 : colors.separator}
          />
        )}
      ></Button>
      <Text style={$text}>
        Page {currentPage} of {totalPages} ({totalCount} items)
      </Text>
      <Button
        onPress={onNextPage}
        disabled={!hasNextPage}
        RightAccessory={() => (
          <Icon
            icon="caretRight"
            color={hasNextPage ? colors.palette.neutral900 : colors.separator}
          />
        )}
      />
    </View>
  )
}

const $root: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  padding: spacing.md,
  alignItems: "center",
}

const $text: TextStyle = {
  textAlign: "center",
  color: colors.palette.neutral700,
}
