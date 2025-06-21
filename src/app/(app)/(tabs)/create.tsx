import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { ViewStyle, TouchableOpacity, View, TextStyle } from "react-native"
import { Icon, Screen, Text } from "src/components"
import { colors } from "src/theme"
import { router } from "expo-router"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

export default observer(function CreateScreen() {
  const { themeContext, themed } = useAppTheme()
  const isDark = themeContext === "dark"

  // Memoize themed styles
  const $themedTitle = useMemo(() => themed($title), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])
  const $themedItemContainer = useMemo(() => themed($itemContainer), [themed])
  const $themedIconContainer = useMemo(() => themed($iconContainer), [themed])
  const $themedTextContainer = useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = useMemo(() => themed($itemDescription), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Text preset="heading" tx="createScreen:title" style={$themedTitle} />

      <View style={$themedListContainer}>
        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.push("/(app)/cookbook/add")}
        >
          <View style={$themedIconContainer}>
            <Icon icon="cookbook" size={44}  />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Cookbook" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Create a new collection and fill it with your favorite recipes"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={26} color={isDark ? colors.border : colors.text} />
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
            <Icon icon="addRecipe" size={44} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Recipe" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Add a recipe to one of your cookbooks"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={26} color={isDark ? colors.border : colors.text} />
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
            <Icon icon="camera" size={44} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Recipe from an Image" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a photo of your favorite recipe"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={26} color={isDark ? colors.border : colors.text} />
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
            <Icon icon="link" size={44} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="A New Recipe from a Website" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a URL"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={26} color={isDark ? colors.border : colors.text} />
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
            <Icon icon="invite" size={44} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Invitation to a Friend" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Send a link to your friend"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={26} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>
      </View>
    </Screen>
  )
})

const $title: ThemedStyle<ViewStyle> = (theme) => ({
  marginBottom: theme.spacing.lg,
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.lg + theme.spacing.xl,
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
