import { observer } from "mobx-react-lite"
import React from "react"
import { ViewStyle, TouchableOpacity, View, TextStyle } from "react-native"
import { Screen, Text } from "src/components"
import { colors, spacing } from "src/theme"
import { router } from "expo-router"
import Ionicons from "@expo/vector-icons/Ionicons"
import { useAppTheme } from "src/utils/useAppTheme"

export default observer(function CreateScreen() {
  const { themeContext } = useAppTheme()
  const isDark = themeContext === "dark"

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text preset="heading" tx="createScreen:title" style={$title} />

      <View style={$listContainer}>
        <TouchableOpacity style={$itemContainer} onPress={() => router.push("/(app)/cookbook/add")}>
          <View style={$iconContainer}>
            <Ionicons name="book-outline" size={32} color={colors.tint} />
          </View>
          <View style={$textContainer}>
            <Text preset="subheading" text="A New Cookbook" style={$itemTitle} />
            <Text
              preset="formHelper"
              text="Create a new collection and fill it with your favorite recipes"
              style={$itemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$itemContainer}
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
          <View style={$iconContainer}>
            <Ionicons name="restaurant-outline" size={32} color={colors.tint} />
          </View>
          <View style={$textContainer}>
            <Text preset="subheading" text="A New Recipe" style={$itemTitle} />
            <Text
              preset="formHelper"
              text="Add a recipe to one of your cookbooks"
              style={$itemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$itemContainer}
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
          <View style={$iconContainer}>
            <Ionicons name="camera-outline" size={32} color={colors.tint} />
          </View>
          <View style={$textContainer}>
            <Text preset="subheading" text="A New Recipe from an Image" style={$itemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a photo of your favorite recipe"
              style={$itemDescription}
            />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$itemContainer}
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
          <View style={$iconContainer}>
            <Ionicons name="globe-outline" size={32} color={colors.tint} />
          </View>
          <View style={$textContainer}>
            <Text preset="subheading" text="A New Recipe from a Website" style={$itemTitle} />
            <Text preset="formHelper" text="Import a recipe from a URL" style={$itemDescription} />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$itemContainer}
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
          <View style={$iconContainer}>
            <Ionicons name="people-outline" size={32} color={colors.tint} />
          </View>
          <View style={$textContainer}>
            <Text preset="subheading" text="Invitation to a Friend" style={$itemTitle} />
            <Text preset="formHelper" text="Send a link to your friend" style={$itemDescription} />
          </View>
          <Ionicons name="chevron-forward" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $container: ViewStyle = {
  paddingTop: spacing.xl,
}

const $title: ViewStyle = {
  marginBottom: spacing.lg,
  paddingHorizontal: spacing.lg,
}

const $listContainer: ViewStyle = {
  backgroundColor: colors.backgroundDim,
  marginHorizontal: spacing.lg,
  borderRadius: spacing.md,
}

const $itemContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.background,
  minHeight: 80,
}

const $firstItem: ViewStyle = {
  borderTopLeftRadius: spacing.md,
  borderTopRightRadius: spacing.md,
}

const $lastItem: ViewStyle = {
  borderBottomWidth: 0,
  borderBottomLeftRadius: spacing.md,
  borderBottomRightRadius: spacing.md,
}

const $iconContainer: ViewStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.md,
}

const $textContainer: ViewStyle = {
  flex: 1,
  marginRight: spacing.sm,
}

const $itemTitle: TextStyle = {
  fontSize: 16,
  marginBottom: spacing.xs,
}

const $itemDescription: TextStyle = {
  color: colors.textDim,
  fontSize: 14,
}
