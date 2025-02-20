import React, { FC } from "react"
import { View, Image, ImageStyle, ViewStyle, TextStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { ListItem } from "app/components"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"

interface RecipeDrawerProps {
  handleEditRecipe: () => void
  handleDeleteRecipe: () => void
  isAuthor: boolean
}

const logo = require("../../assets/images/logo.png")

export const RecipeDrawer: FC<RecipeDrawerProps> = ({ handleEditRecipe, handleDeleteRecipe, isAuthor }) => {
  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  return (
    <View style={[$drawer, $drawerInsets]}>
      <View style={$logoContainer}>
        <Image source={logo} style={$logoImage} />
      </View>
      <ListItem
        disabled={!isAuthor}
        tx="recipeDetailsScreen.edit"
        rightIcon="caretRight"
        onPress={handleEditRecipe}
        textStyle={[ 
          $right, 
          !isAuthor && { color: colors.palette.neutral400 } 
        ]}
      />
      <ListItem
        disabled={!isAuthor}
        text="Delete"
        rightIcon="caretRight"
        onPress={handleDeleteRecipe}
        textStyle={[ 
          $right, 
          !isAuthor && { color: colors.palette.neutral400 } 
        ]}
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
