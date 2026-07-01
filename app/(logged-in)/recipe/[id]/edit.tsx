import { ItemNotFound } from "@/components/ItemNotFound"
import { RecipeAiEditDialog, RecipeAiEditFab } from "@/components/Recipe/RecipeAiEditDialog"
import { RecipeForm, RecipeFormHandle, RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import { Screen } from "@/components/Screen"
import { translate } from "@/i18n"
import {
  useApplyRecipeEditFromPromptMutation,
  useRecipeQuery,
  useUpdateRecipeMutation,
} from "@/hooks/queries/useRecipesQuery"
import { useSelectedCookbook } from "@/hooks/useSelectedCookbook"
import { useSubscriptionStore } from "@/stores/subscriptionStore"
import { getCurrentWeekKey, useUiStore, WEEKLY_IMPORT_LIMIT } from "@/stores/uiStore"
import type { RecipeSnapshotIn } from "@/types/recipe"
import {
  formInputsToRecipeSnapshotIn,
  recipeLikeToFormInputs,
  updateDtoToFormInputs,
} from "@/utils/recipeFormMappers"
import { formDataToIngredientSectionsSnapshot } from "@/utils/recipeIngredientSections"
import { router, useLocalSearchParams } from "expo-router"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { View, ViewStyle } from "react-native"

export default function EditRecipe() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const recipeId = id ?? ""
  const { t } = useTranslation()
  const { data: selected } = useRecipeQuery(recipeId)
  const updateRecipe = useUpdateRecipeMutation()
  const applyAiEdit = useApplyRecipeEditFromPromptMutation()
  const { selected: cookbook } = useSelectedCookbook()

  const isPro = useSubscriptionStore((s) => s.isPro)
  const weeklyImportCount = useUiStore((s) => s.weeklyImportCount)
  const weeklyImportWeekStart = useUiStore((s) => s.weeklyImportWeekStart)

  const formRef = useRef<RecipeFormHandle | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [appliedFormValues, setAppliedFormValues] = useState<RecipeFormInputs | null>(null)
  const [dialogVisible, setDialogVisible] = useState(false)
  const [aiErrorMsg, setAiErrorMsg] = useState("")

  const currentWeek = getCurrentWeekKey()
  const effectiveImportCount = weeklyImportWeekStart === currentWeek ? weeklyImportCount : 0
  const isAtLimit = !isPro && effectiveImportCount >= WEEKLY_IMPORT_LIMIT

  const mapRecipeToFormInputs = useCallback((): RecipeFormInputs | null => {
    if (!selected) return null
    return recipeLikeToFormInputs(selected)
  }, [selected])

  const resolveFormValues = useMemo(
    () => appliedFormValues ?? mapRecipeToFormInputs() ?? undefined,
    [appliedFormValues, mapRecipeToFormInputs],
  )

  const handleFabPress = useCallback(() => {
    if (isAtLimit) {
      router.push("/(logged-in)/recipe/paywall")
      return
    }
    setAiErrorMsg("")
    setDialogVisible(true)
  }, [isAtLimit])

  const handleApplyAiEdit = useCallback(
    async (prompt: string) => {
      if (!selected) return

      setAiErrorMsg("")
      const formValues = formRef.current?.getValues() ?? resolveFormValues
      if (!formValues) return

      const recipePayload = formInputsToRecipeSnapshotIn(formValues, selected)

      const result = await applyAiEdit.mutateAsync({
        recipeId: selected.id,
        prompt,
        recipe: recipePayload,
      })

      if (result.ok) {
        setAppliedFormValues(updateDtoToFormInputs(result.recipe as RecipeSnapshotIn))
        setFormKey((k) => k + 1)
        setDialogVisible(false)
        return
      }

      if (result.kind === "rate-limited") {
        setAiErrorMsg(t("recipeAiEditDialog:rateLimited"))
      } else {
        setAiErrorMsg(t("recipeAiEditDialog:parseFailed"))
      }
    },
    [applyAiEdit, resolveFormValues, selected, t],
  )

  const onPressSend = async (formData: RecipeFormInputs) => {
    const updatedRecipe: RecipeSnapshotIn = {
      id: selected?.id ?? "",
      title: formData.title?.trim() ?? "",
      summary: formData.summary?.trim() ?? "",
      thumbnail: selected?.thumbnail ?? null,
      videoPath: selected?.videoPath ?? null,
      preparationTimeInMinutes: formData.preparationTimeInMinutes,
      cookingTimeInMinutes: formData.cookingTimeInMinutes,
      bakingTimeInMinutes: formData.bakingTimeInMinutes,
      servings: formData.servings,
      author: selected?.author,
      directions: formData.directions
        .filter((direction) => direction.text?.trim())
        .map((direction, index) => ({
          text: direction.text.trim(),
          ordinal: index + 1,
          image: direction.image || null,
        })),
      ingredientSections: formDataToIngredientSectionsSnapshot(formData),
      images: formData.images
        .filter((image) => image?.trim())
        .map((image, index) => ({
          name: image.trim(),
          ordinal: index + 1,
        })),
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
      await updateRecipe.mutateAsync(updatedRecipe)
      router.replace(`/(logged-in)/cookbook/${cookbook?.id ?? ""}`)
    } catch (error) {
      console.error("Update recipe failed:", error)
      alert(translate("recipeEditScreen:updateFailed"))
    }
  }

  const onError = (errors: unknown) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  if (!selected) return <ItemNotFound message={translate("recipeEditScreen:notFound")} />

  return (
    <View style={$screenRoot}>
      <Screen preset="scroll">
        <RecipeForm
          key={formKey}
          onSubmit={onPressSend}
          onError={onError}
          formValues={resolveFormValues}
          isEdit={true}
          formRef={formRef}
        />
      </Screen>

      <RecipeAiEditFab onPress={handleFabPress} showLock={isAtLimit} />
      <RecipeAiEditDialog
        visible={dialogVisible}
        isLoading={applyAiEdit.isPending}
        errorMsg={aiErrorMsg}
        onDismiss={() => setDialogVisible(false)}
        onApply={handleApplyAiEdit}
      />
    </View>
  )
}

const $screenRoot: ViewStyle = {
  flex: 1,
}
