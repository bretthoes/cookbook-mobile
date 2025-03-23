import React from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "src/models/helpers/useStores"
import { RecipeForm, RecipeFormInputs } from "src/components/Recipe/RecipeForm"
import { RecipeSnapshotIn } from "src/models/Recipe"
import { Screen } from "src/components"
import { router } from "expo-router"
import { useForm } from "react-hook-form"

export default observer(function EditRecipe() {
  const {
    recipeStore: { currentRecipe, updateRecipe },
  } = useStores()
  const { handleSubmit } = useForm<RecipeFormInputs>()

  const mapRecipeToFormInputs = (): RecipeFormInputs | null => {
    if (!currentRecipe) return null
    return {
      title: currentRecipe.title,
      summary: currentRecipe.summary,
      preparationTimeInMinutes: currentRecipe.preparationTimeInMinutes,
      cookingTimeInMinutes: currentRecipe.cookingTimeInMinutes,
      bakingTimeInMinutes: currentRecipe.bakingTimeInMinutes,
      servings: currentRecipe.servings,
      ingredients:
        currentRecipe.ingredients?.map((ingredient) => ({
          name: ingredient.name,
          optional: ingredient.optional,
        })) ?? [],
      directions:
        currentRecipe.directions?.map((direction) => ({
          text: direction.text,
          image: direction.image,
        })) ?? [],
      images: currentRecipe.images?.map((image) => image.name) ?? [],
    }
  }

  const onPressSend = async (formData: RecipeFormInputs) => {
    console.log("formData", formData)
    const updatedRecipe: RecipeSnapshotIn = {
      id: currentRecipe?.id ?? 0,
      title: formData.title?.trim() ?? "",
      summary: formData.summary?.trim() ?? "",
      thumbnail: null, // TODO handle thumbnail logic
      videoPath: null, // TODO handle videoPath logic
      preparationTimeInMinutes: formData.preparationTimeInMinutes,
      cookingTimeInMinutes: formData.cookingTimeInMinutes,
      bakingTimeInMinutes: formData.bakingTimeInMinutes,
      servings: formData.servings,
      authorEmail: currentRecipe?.authorEmail,
      author: currentRecipe?.author,
      directions: formData.directions.map((direction, index) => ({
        id: 0,
        text: direction.text?.trim() ?? "",
        ordinal: index + 1,
        image: null,
      })),
      ingredients: formData.ingredients.map((ingredient, index) => ({
        id: 0,
        name: ingredient.name?.trim() ?? "",
        optional: false,
        ordinal: index + 1,
      })),
      images: formData.images.map((image, index) => ({
        id: 0,
        name: image?.trim() ?? "",
        ordinal: index + 1,
      })),
    }

    try {
      await updateRecipe(updatedRecipe)
      router.back()
    } catch (e) {
      console.error("Update recipe failed:", e)

      if (e instanceof Error) {
        console.error("Error message:", e.message)
        console.error("Stack trace:", e.stack)
      } else {
        console.error("Non-standard error:", JSON.stringify(e, null, 2))
      }

      alert("Update recipe failed")
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  return (
    <Screen preset="scroll">
      <RecipeForm
        onSubmit={onPressSend}
        onError={onError}
        formValues={mapRecipeToFormInputs() ?? undefined}
        isEdit={true}
      />
    </Screen>
  )
})

