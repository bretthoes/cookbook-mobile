import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

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
          onPress={() => router.replace(`../recipe/add`)}
        >
          <View style={$themedIconContainer}>
            <Icon icon="create" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Add Recipe Manually" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Create a new recipe from scratch"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() => router.replace(`../recipe/select-url`)}
        >
          <View style={$themedIconContainer}>
            <Icon icon="link" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Add Recipe from URL" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a website"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={24} color={isDark ? colors.border : colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={$themedItemContainer}
          onPress={() =>
            router.replace({
              pathname: "../select-cookbook",
              params: {
                nextRoute: "/(logged-in)/(tabs)/recipe/add",
                action: "Select a cookbook to add the recipe to.",
                onSelect: "handleAddRecipeFromCamera",
              },
            })
          }
        >
          <View style={$themedIconContainer}>
            <Icon icon="camera" size={32} color={colors.tint} />
          </View>
          <View style={$themedTextContainer}>
            <Text preset="subheading" text="Add Recipe from Photo" style={$themedItemTitle} />
            <Text
              preset="formHelper"
              text="Import a recipe from a photo"
              style={$themedItemDescription}
            />
          </View>
          <Icon icon="caretRight" size={24} color={isDark ? colors.border : colors.text} />
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
