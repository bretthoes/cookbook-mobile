import { spacing } from "src/theme"
import { ViewStyle } from "react-native"
import { RecipeToAddSnapshotIn } from "src/models/Recipe"
import { useStores } from "src/models/helpers/useStores"
import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { Screen } from "src/components"
import { RecipeForm, RecipeFormInputs } from "src/components/Recipe/RecipeForm"
import { router } from "expo-router"

export default observer(function AddRecipeScreen() {
  // Pull in one of our MST stores
  const {
    recipeStore: { recipeToAdd, clearRecipeToAdd, create },
    cookbookStore: { selected },
  } = useStores()

  useEffect(() => {
    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      clearRecipeToAdd()
    }
  }, [clearRecipeToAdd])

  const mapRecipeToFormInputs = (): RecipeFormInputs | null => {
    if (!recipeToAdd) return null
    return {
      title: recipeToAdd.title,
      summary: recipeToAdd.summary,
      preparationTimeInMinutes: recipeToAdd.preparationTimeInMinutes,
      cookingTimeInMinutes: recipeToAdd.cookingTimeInMinutes,
      bakingTimeInMinutes: recipeToAdd.bakingTimeInMinutes,
      servings: recipeToAdd.servings,
      ingredients:
        recipeToAdd.ingredients?.map((ingredient) => ({
          name: ingredient.name,
          optional: ingredient.optional,
        })) ?? [],
      directions:
        recipeToAdd.directions?.map((direction) => ({
          text: direction.text,
          image: direction.image,
        })) ?? [],
      images: recipeToAdd.images?.map((image) => image.name) ?? [],
    }
  }

  const onPressSend = async (formData: RecipeFormInputs) => {
    const newRecipe: RecipeToAddSnapshotIn = {
      title: formData.title.trim(),
      cookbookId: selected?.id ?? 0,
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
      var success = await create(newRecipe)
      if (success) {
        router.replace(`/(app)/cookbook/${selected?.id}`)
      } else {
        alert("Failed to create recipe")
      }
    } catch (e) {
      console.error("Add recipe failed:", e)

      if (e instanceof Error) {
        console.error("Error message:", e.message)
        console.error("Stack trace:", e.stack)
      } else console.error("Non-standard error:", JSON.stringify(e, null, 2))

      alert("Add recipe failed")
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  return (
    <Screen preset="scroll">
      <RecipeForm
        onSubmit={onPressSend}
        formValues={mapRecipeToFormInputs() ?? undefined}
        onError={onError}
      />
    </Screen>
  )
})
