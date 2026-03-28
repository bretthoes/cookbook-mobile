import { translate } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon, IconTypes } from "./Icon"

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  leftIcon?: IconTypes
  leftIconColor?: string
  onLeftIconPress?: () => void
}

/**
 * A search bar.
 */
export const SearchBar = observer(function SearchBar(props: SearchBarProps) {
  const { value, onChangeText, placeholder, leftIcon, leftIconColor, onLeftIconPress } = props
  const { themed } = useAppTheme()

  const $themedRoot = React.useMemo(() => themed($root), [themed])
  const $themedSearchBar = React.useMemo(() => themed($searchBar), [themed])

  return (
    <View style={$themedRoot}>
      <Icon icon="search" size={20} color={colors.textDim} containerStyle={$leftIcon} />
      <TextInput
        style={$themedSearchBar}
        placeholder={placeholder ?? translate("recipeListScreen:searchPlaceholder")}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.border}
      />
      {leftIcon && (
        <TouchableOpacity onPress={onLeftIconPress} disabled={!onLeftIconPress}>
          <Icon icon={leftIcon} size={20} color={leftIconColor ?? colors.textDim} />
        </TouchableOpacity>
      )}
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

const $leftIcon: ViewStyle = {
  marginRight: 6,
}

const $searchBar: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
})
