import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { RecipeForm, RecipeFormInputs, Screen, Text } from "app/components"
import { RecipeSnapshotIn } from "app/models/Recipe"
import { useStores } from "app/models"
import { useNavigation } from "@react-navigation/native"
// import { useNavigation } from "@react-navigation/native"
// import { useStores } from "app/models"

interface EditRecipeScreenProps extends AppStackScreenProps<"EditRecipe"> {}

export const EditRecipeScreen: FC<EditRecipeScreenProps> = observer(function EditRecipeScreen() {
  // Pull in one of our MST stores
  const { recipeStore } = useStores()
  const navigation = useNavigation<AppStackScreenProps<"RecipeDetails">["navigation"]>()
  const onPressSend = async (formData: RecipeFormInputs) => {
    const newRecipe: RecipeSnapshotIn = {
      id: recipeStore.currentRecipe?.id ?? 0,
      title: formData.title.trim(),
      summary: formData.summary?.trim() || null,
      thumbnail: null, // TODO handle thumbnail logic
      videoPath: null, // TODO handle videoPath logic
      preparationTimeInMinutes: formData.preparationTimeInMinutes,
      cookingTimeInMinutes: formData.cookingTimeInMinutes,
      bakingTimeInMinutes: formData.bakingTimeInMinutes,
      servings: formData.servings,
      directions: formData.directions.map((direction, index) => ({
        id: 0,
        text: direction.text.trim(),
        ordinal: index + 1,
        image: null,
      })),
      ingredients: formData.ingredients.map((ingredient, index) => ({
        id: 0,
        name: ingredient.name.trim(),
        optional: false,
        ordinal: index + 1,
      })),
      images: formData.images.map((image, index) => ({
        id: 0,
        name: image.trim(),
        ordinal: index + 1,
      })),
    }

    try {
      await recipeStore.createRecipe(newRecipe)

      navigation.replace("RecipeDetails")
    } catch (e) {
      console.error("Add recipe failed:", e)

      if (e instanceof Error) {
        console.error("Error message:", e.message)
        console.error("Stack trace:", e.stack)
      } else {
        console.error("Non-standard error:", JSON.stringify(e, null, 2))
      }

      alert("Add recipe failed")
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }
  return (
    <Screen style={$root} preset="scroll">
      <Text text="editRecipe" />
      <RecipeForm onSubmit={onPressSend} onError={onError} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
