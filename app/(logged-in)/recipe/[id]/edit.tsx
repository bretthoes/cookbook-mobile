import { ItemNotFound } from "@/components/ItemNotFound"
import { RecipeForm, RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import { Screen } from "@/components/Screen"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { RecipeSnapshotIn } from "@/models/Recipe"
import { formDataToIngredientSectionsSnapshot } from "@/utils/recipeIngredientSections"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React from "react"

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
      ingredientSections:
        selected.ingredientSections?.map((section) => ({
          id: section.id,
          title: section.title,
          ingredients: section.ingredients.map((ingredient) => ({
            name: ingredient.name,
            optional: ingredient.optional,
          })),
        })) ?? [],
      directions:
        selected.directions?.map((direction) => ({
          text: direction.text,
          image: direction.image,
        })) ?? [],
      images: selected.images?.map((image) => image.name) ?? [],
      isVegetarian: selected.isVegetarian ?? null,
      isVegan: selected.isVegan ?? null,
      isGlutenFree: selected.isGlutenFree ?? null,
      isDairyFree: selected.isDairyFree ?? null,
      isCheap: selected.isCheap ?? null,
      isHealthy: selected.isHealthy ?? null,
      isLowFodmap: selected.isLowFodmap ?? null,
      isHighProtein: selected.isHighProtein ?? null,
      isBreakfast: selected.isBreakfast ?? null,
      isLunch: selected.isLunch ?? null,
      isDinner: selected.isDinner ?? null,
      isDessert: selected.isDessert ?? null,
      isSnack: selected.isSnack ?? null,
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
        image: direction.image || null,
      })),
      ingredientSections: formDataToIngredientSectionsSnapshot(formData, {
        sectionIds: "preserve",
      }),
      images: formData.images.map((name, index) => {
        const trimmed = name?.trim() ?? ""
        const existing = selected?.images?.find((img) => img.name === trimmed)
        return {
          id: existing?.id ?? 0,
          name: trimmed,
          ordinal: index + 1,
        }
      }),
      isVegetarian: formData.isVegetarian ?? null,
      isVegan: formData.isVegan ?? null,
      isGlutenFree: formData.isGlutenFree ?? null,
      isDairyFree: formData.isDairyFree ?? null,
      isCheap: formData.isCheap ?? null,
      isHealthy: formData.isHealthy ?? null,
      isLowFodmap: formData.isLowFodmap ?? null,
      isHighProtein: formData.isHighProtein ?? null,
      isBreakfast: formData.isBreakfast ?? null,
      isLunch: formData.isLunch ?? null,
      isDinner: formData.isDinner ?? null,
      isDessert: formData.isDessert ?? null,
      isSnack: formData.isSnack ?? null,
    }

    try {
      const success = await update(updatedRecipe)
      if (success) {
        router.replace(`../../cookbook/${cookbook?.id}`)
      } else {
        alert(translate("recipeEditScreen:updateFailed"))
      }
    } catch (error) {
      console.error("Update recipe failed:", error)
      alert(translate("recipeEditScreen:updateFailed"))
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  if (!selected) return <ItemNotFound message={translate("recipeEditScreen:notFound")} />

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
