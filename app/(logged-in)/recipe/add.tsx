import { RecipeForm, RecipeFormHandle, RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { translate } from "@/i18n"
import { RecipeToAddSnapshotIn } from "@/models/Recipe"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

export default observer(function AddRecipeScreen() {
  const { recipeStore, cookbookStore } = useStores()
  const { recipeToAdd, clearRecipeToAdd, create, saveDraft, deleteDraft, getDraftForCookbook } =
    recipeStore
  const { themed } = useAppTheme()

  // Only restore a draft when the user explicitly tapped "Continue Draft"
  const { continueDraft } = useLocalSearchParams<{ continueDraft?: string }>()
  const shouldRestoreDraft = continueDraft === "1"

  // Ref exposing the live form state to unmount cleanup without needing a re-render
  const formRef = useRef<RecipeFormHandle | null>(null)

  // The selected cookbook comes from cookbookStore (set by select-cookbook screen)
  const selectedCookbook = cookbookStore.selected

  const $themedCookbookLabel = useMemo(() => themed($cookbookLabel), [themed])
  const $themedCookbookHeader = useMemo(() => themed($cookbookHeader), [themed])
  const $themedCookbookImage = useMemo(() => themed($cookbookImage), [themed])
  const $themedCookbookTitle = useMemo(() => themed($cookbookTitle), [themed])

  const cookbookImageSource = useMemo(() => {
    if (!selectedCookbook) return null
    if (selectedCookbook.image) {
      return { uri: selectedCookbook.image }
    }
    return getCookbookImage(selectedCookbook.id)
  }, [selectedCookbook])

  useEffect(() => {
    return () => {
      clearRecipeToAdd()
      // Save draft on unmount if the form is dirty and a cookbook is selected
      if (selectedCookbook && formRef.current?.isDirty) {
        saveDraft(selectedCookbook.id, formRef.current.getValues())
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Map recipeToAdd (from social/URL/voice imports) to form inputs — takes priority over draft */
  const mapRecipeToAddToFormInputs = (): RecipeFormInputs | null => {
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
      isVegetarian: recipeToAdd.isVegetarian ?? null,
      isVegan: recipeToAdd.isVegan ?? null,
      isGlutenFree: recipeToAdd.isGlutenFree ?? null,
      isDairyFree: recipeToAdd.isDairyFree ?? null,
      isCheap: recipeToAdd.isCheap ?? null,
      isHealthy: recipeToAdd.isHealthy ?? null,
      isLowFodmap: recipeToAdd.isLowFodmap ?? null,
      isHighProtein: recipeToAdd.isHighProtein ?? null,
      isBreakfast: recipeToAdd.isBreakfast ?? null,
      isLunch: recipeToAdd.isLunch ?? null,
      isDinner: recipeToAdd.isDinner ?? null,
      isDessert: recipeToAdd.isDessert ?? null,
      isSnack: recipeToAdd.isSnack ?? null,
    }
  }

  /** Map a saved draft to form inputs */
  const mapDraftToFormInputs = (cookbookId: number): RecipeFormInputs | null => {
    const draft = getDraftForCookbook(cookbookId)
    if (!draft) return null
    return {
      title: draft.title,
      summary: draft.summary,
      preparationTimeInMinutes: draft.preparationTimeInMinutes,
      cookingTimeInMinutes: draft.cookingTimeInMinutes,
      bakingTimeInMinutes: draft.bakingTimeInMinutes,
      servings: draft.servings,
      ingredients: draft.ingredients.map((i) => ({ name: i.name, optional: i.optional })),
      directions: draft.directions.map((d) => ({ text: d.text, image: d.image })),
      images: draft.images.map((img) => img.name),
      isVegetarian: draft.isVegetarian ?? null,
      isVegan: draft.isVegan ?? null,
      isGlutenFree: draft.isGlutenFree ?? null,
      isDairyFree: draft.isDairyFree ?? null,
      isCheap: draft.isCheap ?? null,
      isHealthy: draft.isHealthy ?? null,
      isLowFodmap: draft.isLowFodmap ?? null,
      isHighProtein: draft.isHighProtein ?? null,
      isBreakfast: draft.isBreakfast ?? null,
      isLunch: draft.isLunch ?? null,
      isDinner: draft.isDinner ?? null,
      isDessert: draft.isDessert ?? null,
      isSnack: draft.isSnack ?? null,
    }
  }

  /** Resolve initial form values: recipeToAdd (import) > draft (only when explicitly continuing) > nothing */
  const resolveFormValues = (): RecipeFormInputs | undefined => {
    const fromImport = mapRecipeToAddToFormInputs()
    if (fromImport) return fromImport
    if (shouldRestoreDraft && selectedCookbook) {
      const fromDraft = mapDraftToFormInputs(selectedCookbook.id)
      if (fromDraft) return fromDraft
    }
    return undefined
  }

  const onPressSend = useCallback(
    async (formData: RecipeFormInputs) => {
      if (!selectedCookbook) {
        alert(translate("recipeAddScreen:noCookbookSelected"))
        return
      }

      const validDirections = formData.directions
        .filter((direction) => direction.text?.trim())
        .map((direction, index) => ({
          id: 0,
          text: direction.text.trim(),
          ordinal: index + 1,
          image: direction.image || null,
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
        thumbnail: null,
        videoPath: null,
        preparationTimeInMinutes: formData.preparationTimeInMinutes,
        cookingTimeInMinutes: formData.cookingTimeInMinutes,
        bakingTimeInMinutes: formData.bakingTimeInMinutes,
        servings: formData.servings,
        directions: validDirections,
        ingredients: validIngredients,
        images: validImages,
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
        const success = await create(newRecipe)
        if (success) {
          // Clear the draft on successful submit
          deleteDraft(selectedCookbook.id)
          router.replace(`../../cookbook/${selectedCookbook.id}`)
        } else {
          // Save draft when create returns false (non-throwing failure)
          saveDraft(selectedCookbook.id, formData)
          alert(translate("recipeAddScreen:createFailed"))
        }
      } catch (e) {
        console.error("Add recipe failed:", e)

        if (e instanceof Error) {
          console.error("Error message:", e.message)
          console.error("Stack trace:", e.stack)
        } else console.error("Non-standard error:", JSON.stringify(e, null, 2))

        // Save draft when create throws
        saveDraft(selectedCookbook.id, formData)
        alert(translate("recipeAddScreen:createFailed"))
      }
    },
    [create, deleteDraft, saveDraft, selectedCookbook],
  )

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  return (
    <Screen preset="scroll">
      {selectedCookbook && cookbookImageSource && (
        <>
          <Text tx="recipeAddScreen:addingTo" style={$themedCookbookLabel} />
          <View style={$themedCookbookHeader}>
            <Image source={cookbookImageSource} style={$themedCookbookImage} />
            <Text preset="bold" text={selectedCookbook.title} style={$themedCookbookTitle} />
          </View>
        </>
      )}
      <RecipeForm
        onSubmit={onPressSend}
        formValues={resolveFormValues()}
        onError={onError}
        formRef={formRef}
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
