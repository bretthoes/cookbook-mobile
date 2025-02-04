import React, { FC } from "react"
import { View, Image, ImageStyle, ViewStyle, TextStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { ListItem } from "app/components"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"

interface RecipeDrawerProps {
  handleEditRecipe: () => void
}

const logo = require("../../../assets/images/logo.png")

export const RecipeDrawer: FC<RecipeDrawerProps> = ({ handleEditRecipe }) => {
  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  return (
    <View style={[$drawer, $drawerInsets]}>
      <View style={$logoContainer}>
        <Image source={logo} style={$logoImage} />
      </View>
      <ListItem
        tx="recipeDetailsScreen.edit"
        textStyle={$right}
        rightIcon="caretRight"
        onPress={handleEditRecipe}
      />
    </View>
  )
}

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-end",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}

const $right: TextStyle = {
  textAlign: "right",
}
