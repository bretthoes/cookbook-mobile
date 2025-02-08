import { AppStackScreenProps } from "app/navigators"
import { spacing } from "app/theme"
import { ViewStyle } from "react-native"
import { RecipeToAddSnapshotIn } from "app/models/Recipe"
import { useStores } from "app/models"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { FC } from "react"
import { Screen } from "app/components"
import { RecipeForm, RecipeFormInputs } from "app/components/RecipeForm"

interface AddRecipeScreenProps extends AppStackScreenProps<"AddRecipe"> {}

export const AddRecipeScreen: FC<AddRecipeScreenProps> = observer(function AddRecipeScreen() {
  // Pull in one of our MST stores
  const { recipeStore, cookbookStore } = useStores()
  const navigation = useNavigation<AppStackScreenProps<"RecipeDetails">["navigation"]>()

  const onPressSend = async (formData: RecipeFormInputs) => {
    const newRecipe: RecipeToAddSnapshotIn = {
      title: formData.title.trim(),
      cookbookId: cookbookStore.currentCookbook?.id ?? 0,
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
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$root}>
      <RecipeForm onSubmit={onPressSend} onError={onError} />
    </Screen>
  )
})

const $root: ViewStyle = {
  marginHorizontal: spacing.md,
  marginTop: spacing.xl,
}
