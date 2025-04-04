import * as React from "react"
import { TextInput, TextStyle, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"
import { colors, spacing } from "src/theme"
import Feather from "@expo/vector-icons/Feather"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

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
  const { themed } = useAppTheme()

  const $themedRoot = React.useMemo(() => themed($root), [themed])
  const $themedSearchBar = React.useMemo(() => themed($searchBar), [themed])

  return (
    <View style={$themedRoot}>
      <TextInput
        style={$themedSearchBar}
        placeholder={placeholder ?? "Search"} // TODO i8n
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.border}
      />
      <Feather name="search" size={20} color={colors.textDim} />
    </View>
  )
})

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  marginHorizontal: theme.spacing.sm,
  borderColor: theme.colors.borderDim,
  borderWidth: 1,
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.backgroundDim,
})

const $searchBar: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
})
