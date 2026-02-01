import { RecipeForm, RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { RecipeToAddSnapshotIn } from "@/models/Recipe"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useMemo } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

export default observer(function AddRecipeScreen() {
  // Pull in one of our MST stores
  const {
    recipeStore: { recipeToAdd, clearRecipeToAdd, create },
    cookbookStore,
  } = useStores()
  const { themed } = useAppTheme()

  // The selected cookbook comes from cookbookStore (set by select-cookbook screen)
  const selectedCookbook = cookbookStore.selected

  // Memoize themed styles
  const $themedCookbookLabel = useMemo(() => themed($cookbookLabel), [themed])
  const $themedCookbookHeader = useMemo(() => themed($cookbookHeader), [themed])
  const $themedCookbookImage = useMemo(() => themed($cookbookImage), [themed])
  const $themedCookbookTitle = useMemo(() => themed($cookbookTitle), [themed])

  // Get cookbook image source
  const cookbookImageSource = useMemo(() => {
    if (!selectedCookbook) return null
    if (selectedCookbook.image) {
      return { uri: selectedCookbook.image }
    }
    return getCookbookImage(selectedCookbook.id)
  }, [selectedCookbook])

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

  const onPressSend = useCallback(
    async (formData: RecipeFormInputs) => {
      if (!selectedCookbook) {
        alert("No cookbook selected")
        return
      }

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
        cookbookId: selectedCookbook.id,
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
        const success = await create(newRecipe)
        if (success) {
          router.replace(`../../cookbook/${selectedCookbook.id}`)
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
    [create, selectedCookbook],
  )

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  return (
    <Screen preset="scroll">
      {selectedCookbook && cookbookImageSource && (
        <>
          <Text text="Adding recipe to:" style={$themedCookbookLabel} />
          <View style={$themedCookbookHeader}>
            <Image source={cookbookImageSource} style={$themedCookbookImage} />
            <Text preset="bold" text={selectedCookbook.title} style={$themedCookbookTitle} />
          </View>
        </>
      )}
      <RecipeForm
        onSubmit={onPressSend}
        formValues={mapRecipeToFormInputs() ?? undefined}
        onError={onError}
      />
    </Screen>
  )
})

const $cookbookLabel: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginHorizontal: theme.spacing.md,
  marginBottom: theme.spacing.xs,
})

const $cookbookHeader: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  marginHorizontal: theme.spacing.md,
  marginBottom: theme.spacing.xs,
  borderRadius: theme.spacing.sm,
})

const $cookbookImage: ThemedStyle<ImageStyle> = () => ({
  width: 64,
  height: 64,
  borderRadius: 32,
})

const $cookbookTitle: ThemedStyle<TextStyle> = (theme) => ({
  marginLeft: theme.spacing.sm,
  flex: 1,
})
