import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { UseCase } from "@/components/UseCase"
import { Cookbook } from "@/models/Cookbook"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { observer } from "mobx-react-lite"
import { useMemo, useState } from "react"
import { ScrollView, TextStyle, TouchableOpacity, ViewStyle } from "react-native"

export interface CookbookDropdownProps {
  /**
   * Array of cookbooks to display in the dropdown
   */
  cookbooks: Cookbook[]
  /**
   * Currently selected cookbook
   */
  selectedCookbook: Cookbook | null
  /**
   * Callback when a cookbook is selected
   */
  onSelect: (cookbook: Cookbook) => void
  /**
   * Error message to display below the dropdown
   */
  error?: string
}

/**
 * A reusable dropdown component for selecting a cookbook.
 * Displays a button that opens a modal with a list of cookbooks to choose from.
 */
const PLACEHOLDER = "Select a cookbook"
const DESCRIPTION = "Select the cookbook where you would like to add this recipe."

export const CookbookDropdown = observer(function CookbookDropdown(props: CookbookDropdownProps) {
  const { cookbooks, selectedCookbook, onSelect, error } = props

  const { themed } = useAppTheme()
  const [isDropdownVisible, setIsDropdownVisible] = useState(false)

  const $themedDropdownButton = useMemo(() => themed($dropdownButton(error)), [themed, error])
  const $themedDropdownText = useMemo(() => themed($dropdownText), [themed])
  const $themedDropdownList = useMemo(() => themed($dropdownList), [themed])
  const $themedDropdownItem = useMemo(() => themed($dropdownItem), [themed])
  const $themedDropdownItemText = useMemo(() => themed($dropdownItemText), [themed])
  const $themedErrorText = useMemo(() => themed($errorText), [themed])

  const handleSelect = (cookbook: Cookbook) => {
    onSelect(cookbook)
    setIsDropdownVisible(false)
  }

  return (
    <UseCase description={DESCRIPTION}>
      <TouchableOpacity
        style={$themedDropdownButton}
        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
      >
        <Text
          text={selectedCookbook ? selectedCookbook.title : PLACEHOLDER}
          style={$themedDropdownText}
        />
        <Icon
          icon={isDropdownVisible ? "caretUp" : "caretDown"}
          size={20}
          color={colors.textDim}
        />
      </TouchableOpacity>

      {error && <Text text={error} preset="formHelper" style={$themedErrorText} />}

      {isDropdownVisible && cookbooks.length > 0 && (
        <ScrollView style={$themedDropdownList} nestedScrollEnabled>
          {cookbooks.map((item) => (
            <TouchableOpacity
              key={String(item.id)}
              style={$themedDropdownItem}
              onPress={() => handleSelect(item)}
            >
              <Text text={item.title} style={$themedDropdownItemText} />
              {selectedCookbook?.id === item.id && (
                <Icon icon="check" size={20} color={colors.tint} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </UseCase>
  )
})

const $dropdownButton =
  (error?: string): ThemedStyle<ViewStyle> =>
  (theme) => ({
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundDim,
    borderRadius: theme.spacing.xs,
    borderWidth: 1,
    borderColor: error ? theme.colors.error : theme.colors.border,
    minHeight: 50,
  })

const $dropdownText: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
  fontSize: 16,
  color: theme.colors.text,
})

const $dropdownList: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.xs,
  borderWidth: 1,
  borderColor: theme.colors.border,
  maxHeight: 200,
  marginTop: theme.spacing.xs,
  overflow: "hidden",
})

const $dropdownItem: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
})

const $dropdownItemText: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
  fontSize: 16,
  color: theme.colors.text,
})

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  marginTop: theme.spacing.xs,
})
