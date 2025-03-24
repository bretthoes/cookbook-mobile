import * as React from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "src/theme"
import Feather from "@expo/vector-icons/Feather"

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
}

/**
 * A search bar.
 */
export const SearchBar = observer(function SearchBar(props: SearchBarProps) {
  const { value, onChangeText, placeholder } = props

  return (
    <View style={$root}>
      <TextInput
        style={$searchBar}
        placeholder={placeholder ?? "Search"} // TODO i8n
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.palette.neutral400}
      />
      <Feather name="search" size={20} color={colors.palette.neutral600} />
    </View>
  )
})

const $root: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.sm,
  borderColor: colors.palette.neutral500,
  borderWidth: 1,
  borderRadius: spacing.xs,
  backgroundColor: colors.backgroundDim,
}

const $searchBar: TextStyle = {
  flex: 1,
}
