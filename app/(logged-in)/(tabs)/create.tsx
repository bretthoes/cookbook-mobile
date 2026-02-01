import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { Image, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"

const cookbook = require("../../../assets/images/cookbook.png")
const addRecipe = require("../../../assets/images/addRecipe.png")
const invite = require("../../../assets/images/invite.png")

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
          onPress={() => router.push("../cookbook/add")}
        >
          <View style={$themedIconContainer}>
            <Image source={cookbook} style={{ width: 50, height: 50 }} />
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
          onPress={() => router.push("../../recipe/add-options")}
        >
          <View style={$themedIconContainer}>
            <Image source={addRecipe} style={{ width: 50, height: 50 }} />
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
              pathname: "/(logged-in)/(tabs)/select-cookbook",
              params: {
                nextRoute: "/(logged-in)/(tabs)/invitation/add",
                action:
                  "Select the cookbook where you would like to send an invitation to a friend.",
              },
            } as any)
          }
        >
          <View style={$themedIconContainer}>
            <Image source={invite} style={{ width: 50, height: 50 }} />
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

const $title: ThemedStyle<TextStyle> = (theme) => ({
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
