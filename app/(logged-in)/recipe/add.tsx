import { CookbookDropdown } from "@/components/CookbookDropdown"
import { RecipeForm, RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import { Screen } from "@/components/Screen"
import { Cookbook } from "@/models/Cookbook"
import { RecipeToAddSnapshotIn } from "@/models/Recipe"
import { useStores } from "@/models/helpers/useStores"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useRef, useState } from "react"

export default observer(function AddRecipeScreen() {
  // Pull in one of our MST stores
  const {
    recipeStore: { recipeToAdd, clearRecipeToAdd, create },
    cookbookStore,
  } = useStores()
  const [selectedCookbook, setSelectedCookbook] = useState<Cookbook | null>(null)
  const selectedCookbookRef = useRef<Cookbook | null>(null)
  const [_, setIsLoadingCookbooks] = useState(false)
  const [showCookbookError, setShowCookbookError] = useState(false)

  // Keep ref in sync with state
  useEffect(() => {
    selectedCookbookRef.current = selectedCookbook
  }, [selectedCookbook])

  useEffect(() => {
    // Fetch cookbooks on mount
    const fetchCookbooks = async () => {
      setIsLoadingCookbooks(true)
      await cookbookStore.fetch()
      setIsLoadingCookbooks(false)
    }
    fetchCookbooks()

    // Return a "cleanup" function that React will run when the component unmounts
    return () => {
      clearRecipeToAdd()
    }
  }, [clearRecipeToAdd, cookbookStore])

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

  const onPressSend = useCallback(
    async (formData: RecipeFormInputs) => {
      const currentCookbook = selectedCookbookRef.current
      if (!currentCookbook) {
        setShowCookbookError(true)
        return
      }
      setShowCookbookError(false)

      // Filter out empty directions and ingredients, then map to recipe format
      const validDirections = formData.directions
        .filter((direction) => direction.text?.trim())
        .map((direction, index) => ({
          id: 0,
          text: direction.text.trim(),
          ordinal: index + 1,
          image: null,
        }))

      const validIngredients = formData.ingredients
        .filter((ingredient) => ingredient.name?.trim())
        .map((ingredient, index) => ({
          id: 0,
          name: ingredient.name.trim(),
          optional: false,
          ordinal: index + 1,
        }))

      const validImages = formData.images
        .filter((image) => image?.trim())
        .map((image, index) => ({
          id: 0,
          name: image.trim(),
          ordinal: index + 1,
        }))

      const newRecipe: RecipeToAddSnapshotIn = {
        title: formData.title.trim(),
        cookbookId: currentCookbook.id,
        summary: formData.summary?.trim() || null,
        thumbnail: null, // TODO handle thumbnail logic
        videoPath: null, // TODO handle videoPath logic
        preparationTimeInMinutes: formData.preparationTimeInMinutes,
        cookingTimeInMinutes: formData.cookingTimeInMinutes,
        bakingTimeInMinutes: formData.bakingTimeInMinutes,
        servings: formData.servings,
        directions: validDirections,
        ingredients: validIngredients,
        images: validImages,
      }

      try {
        var success = await create(newRecipe)
        if (success) {
          router.replace(`../../cookbook/${currentCookbook.id}`)
        } else {
          alert("Failed to create recipe")
        }
      } catch (e) {
        console.error("Add recipe failed:", e)

        if (e instanceof Error) {
          console.error("Error message:", e.message)
          console.error("Stack trace:", e.stack)
        } else console.error("Non-standard error:", JSON.stringify(e, null, 2))

        alert("Failed to create recipe")
      }
    },
    [create],
  )

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  return (
    <Screen preset="scroll">
      <CookbookDropdown
        cookbooks={cookbookStore.cookbooks.slice()}
        selectedCookbook={selectedCookbook}
        onSelect={(cookbook) => {
          setSelectedCookbook(cookbook)
          setShowCookbookError(false)
        }}
        error={showCookbookError ? "Please select a cookbook" : undefined}
      />

      <RecipeForm
        onSubmit={onPressSend}
        formValues={mapRecipeToFormInputs() ?? undefined}
        onError={onError}
      />
    </Screen>
  )
})
