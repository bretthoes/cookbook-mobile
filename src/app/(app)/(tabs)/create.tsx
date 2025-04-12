import { observer } from "mobx-react-lite"
import React from "react"
import { ViewStyle, TouchableOpacity, View, TextStyle } from "react-native"
import { Screen, Text } from "src/components"
import { colors, spacing } from "src/theme"
import { router } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

export default observer(function CreateScreen() {
  const { themeContext, themed } = useAppTheme()
  const isDark = themeContext === "dark"

  // Memoize themed styles
  const $themedContainer = React.useMemo(() => themed($container), [themed])
  const $themedTitle = React.useMemo(() => themed($title), [themed])
  const $themedListContainer = React.useMemo(() => themed($listContainer), [themed])
  const $themedItemContainer = React.useMemo(() => themed($itemContainer), [themed])
  const $themedFirstItem = React.useMemo(() => themed($firstItem), [themed])
  const $themedLastItem = React.useMemo(() => themed($lastItem), [themed])
  const $themedIconContainer = React.useMemo(() => themed($iconContainer), [themed])
  const $themedTextContainer = React.useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = React.useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = React.useMemo(() => themed($itemDescription), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <Text preset="heading" tx="createScreen:title" style={$themedTitle} />

      <View style={$themedListContainer}>
        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.push("/(app)/cookbook/add")}
        >
          <View style={$themedIconContainer}>
            <Ionicons name="book-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Cookbook" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Create a new collection and fill it with your favorite recipes"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() =>
            router.push({
              pathname: "/(app)/select-cookbook",
              params: {
                nextRoute: "/(app)/recipe/add",
                action: "Select the cookbook where you would like to add a new recipe.",
              },
            } as any)
          }
        >
          <View style={$themedIconContainer}>
            <Ionicons name="restaurant-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Recipe" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Add a recipe to one of your cookbooks"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() =>
            router.push({
              pathname: "/(app)/select-cookbook",
              params: {
                nextRoute: "/(app)/recipe/add",
                action:
                  "Select the cookbook where you would like to add a new recipe from an image.",
                onSelect: "handleAddRecipeFromCamera",
              },
            } as any)
          }
        >
          <View style={$themedIconContainer}>
            <Ionicons name="camera-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Recipe from an Image" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a photo of your favorite recipe"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() =>
            router.push({
              pathname: "/(app)/select-cookbook",
              params: {
                nextRoute: "/(app)/recipe/select-url",
                action:
                  "Select the cookbook where you would like to add a new recipe from a website.",
              },
            } as any)
          }
        >
          <View style={$themedIconContainer}>
            <Ionicons name="globe-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Recipe from a Website" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a URL"
              style={$themedItemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() =>
            router.push({
              pathname: "/(app)/select-cookbook",
              params: {
                nextRoute: "/(app)/invitation/add",
                action:
                  "Select the cookbook where you would like to send an invitation to a friend.",
              },
            } as any)
          }
        >
          <View style={$themedIconContainer}>
            <Ionicons name="people-outline" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Invitation to a Friend" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Send a link to your friend"
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

const $title: ThemedStyle<ViewStyle> = (theme) => ({
  marginBottom: theme.spacing.lg,
  paddingHorizontal: theme.spacing.lg,
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

const $firstItem: ThemedStyle<ViewStyle> = (theme) => ({
  borderTopLeftRadius: theme.spacing.md,
  borderTopRightRadius: theme.spacing.md,
})

const $lastItem: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomWidth: 0,
  borderBottomLeftRadius: theme.spacing.md,
  borderBottomRightRadius: theme.spacing.md,
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.md,
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
