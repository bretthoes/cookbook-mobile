import React from "react"
import { observer } from "mobx-react-lite"
import { useStores } from "src/models/helpers/useStores"
import { RecipeForm, RecipeFormInputs } from "src/components/Recipe/RecipeForm"
import { RecipeSnapshotIn } from "src/models/Recipe"
import { Screen } from "src/components"
import { ItemNotFound } from "src/components/ItemNotFound"
import { router } from "expo-router"

export default observer(function EditRecipe() {
  const {
    recipeStore: { selected, update },
    cookbookStore: { selected: cookbook },
  } = useStores()

  const mapRecipeToFormInputs = (): RecipeFormInputs | null => {
    if (!selected) return null
    return {
      title: selected.title,
      summary: selected.summary,
      preparationTimeInMinutes: selected.preparationTimeInMinutes,
      cookingTimeInMinutes: selected.cookingTimeInMinutes,
      bakingTimeInMinutes: selected.bakingTimeInMinutes,
      servings: selected.servings,
      ingredients:
        selected.ingredients?.map((ingredient) => ({
          name: ingredient.name,
          optional: ingredient.optional,
        })) ?? [],
      directions:
        selected.directions?.map((direction) => ({
          text: direction.text,
          image: direction.image,
        })) ?? [],
      images: selected.images?.map((image) => image.name) ?? [],
    }
  }

  const onPressSend = async (formData: RecipeFormInputs) => {
    const updatedRecipe: RecipeSnapshotIn = {
      id: selected?.id ?? 0,
      title: formData.title?.trim() ?? "",
      summary: formData.summary?.trim() ?? "",
      thumbnail: null, // TODO handle thumbnail logic
      videoPath: null, // TODO handle videoPath logic
      preparationTimeInMinutes: formData.preparationTimeInMinutes,
      cookingTimeInMinutes: formData.cookingTimeInMinutes,
      bakingTimeInMinutes: formData.bakingTimeInMinutes,
      servings: formData.servings,
      authorEmail: selected?.authorEmail,
      author: selected?.author,
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
      const success = await update(updatedRecipe)
      if (success) {
        router.replace(`/(app)/cookbook/${cookbook?.id}`)
      } else {
        alert("Update recipe failed")
      }
    } catch (error) {
      console.error("Update recipe failed:", error)
      alert("Update recipe failed")
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  if (!selected) return <ItemNotFound message="Recipe not found" />

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
