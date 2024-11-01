import * as React from "react"
import { StyleProp, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "app/theme"
import { Text } from "app/components/Text"
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

/**
 * Describe your component here
 */
export const PaginationControls = observer(function PaginationControls(props: PaginationControlsProps) {
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
            color={hasPreviousPage ? colors.palette.neutral900 : colors.palette.neutral300}
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
            color={hasNextPage ? colors.palette.neutral900 : colors.palette.neutral300}
          />
        )}
      />
    </View>
  )
})

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
