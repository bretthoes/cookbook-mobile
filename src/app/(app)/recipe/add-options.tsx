import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { ViewStyle, TouchableOpacity, View, TextStyle } from "react-native"
import { Screen, Text } from "src/components"
import { colors, spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { useHeader } from "src/utils/useHeader"

export default observer(function AddRecipeOptionsScreen() {
  const { themeContext, themed } = useAppTheme()
  const isDark = themeContext === "dark"

  useHeader({
    leftIcon: "back",
    title: "Add Recipe",
    onLeftPress: () => {
      router.back()
    },
  })

  // Memoize themed styles
  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])
  const $themedItemContainer = useMemo(() => themed($itemContainer), [themed])
  const $themedIconContainer = useMemo(() => themed($iconContainer), [themed])
  const $themedTextContainer = useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = useMemo(() => themed($itemDescription), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.replace(`/(app)/recipe/add`)}
        >
          <View style={$themedIconContainer}>
            <Ionicons name="create-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Add Recipe Manually" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Create a new recipe from scratch"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.replace(`/(app)/recipe/select-url`)}
        >
          <View style={$themedIconContainer}>
            <Ionicons name="globe-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Add Recipe from URL" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a website"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.replace({
            pathname: "/(app)/select-cookbook",
            params: {
              nextRoute: "/(app)/recipe/add",
              action: "Select a cookbook to add the recipe to.",
              onSelect: "handleAddRecipeFromCamera"
            }
          })}
        >
          <View style={$themedIconContainer}>
            <Ionicons name="camera-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Add Recipe from Photo" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a photo"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.xl,
})

const $listContainer: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  marginHorizontal: theme.spacing.lg,
  borderRadius: theme.spacing.md,
})

const $itemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.background,
  minHeight: 80,
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.md,
  borderRadius: 24,
})

const $textContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  marginRight: theme.spacing.sm,
})

const $itemTitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  marginBottom: theme.spacing.xs,
})

const $itemDescription: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 14,
}) 