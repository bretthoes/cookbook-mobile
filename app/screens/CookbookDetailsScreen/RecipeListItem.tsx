import { useStores } from "app/models"
import React from "react"
import { observer } from "mobx-react-lite"
import { ListItem } from "../../components"
import { RecipeBrief } from "app/models/Recipe"
import { useNavigation } from "@react-navigation/native"
import { AppStackScreenProps } from "app/navigators"
import { TextStyle } from "react-native"
import { typography } from "app/theme"

export const RecipeListItem = observer(function RecipeListItem({
  recipe,
  index,
  lastIndex,
}: {
  recipe: RecipeBrief
  index: number
  lastIndex: number
}) {
  const navigation = useNavigation<AppStackScreenProps<"CookbookDetails">["navigation"]>()
  const { recipeStore } = useStores()

  const handlePressItem = async () => {
    await recipeStore.fetchRecipe(recipe.id)
    navigation.navigate("RecipeDetails")
  }

  return (
    <ListItem
      onPress={handlePressItem}
      text={recipe.title}
      rightIcon="caretRight"
      textStyle={$customFont}
      TextProps={{ numberOfLines: 1, size: "xs" }}
      topSeparator
      bottomSeparator={index === lastIndex}
    />
  )
})

const $customFont: TextStyle = {
  fontFamily: typography.code?.normal,
}