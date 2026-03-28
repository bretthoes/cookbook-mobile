import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { translate } from "@/i18n"
import { api } from "@/services/api"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { recipeSchema } from "@/validators/recipeSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import * as React from "react"
import { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import {
  ActivityIndicator,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native"

export interface RecipeFormInputs {
  title: string
  summary: string | null
  preparationTimeInMinutes: number | null
  cookingTimeInMinutes: number | null
  bakingTimeInMinutes: number | null
  servings: number | null
  ingredients: {
    name: string
    optional: boolean | null
  }[]
  directions: {
    text: string
    image: string | null
  }[]
  images: string[]
  isVegetarian: boolean | null
  isVegan: boolean | null
  isGlutenFree: boolean | null
  isDairyFree: boolean | null
  isCheap: boolean | null
  isHealthy: boolean | null
  isLowFodmap: boolean | null
  isHighProtein: boolean | null
  isBreakfast: boolean | null
  isLunch: boolean | null
  isDinner: boolean | null
  isDessert: boolean | null
  isSnack: boolean | null
}

const defaultForm: RecipeFormInputs = {
  title: "",
  summary: null,
  preparationTimeInMinutes: null,
  cookingTimeInMinutes: null,
  bakingTimeInMinutes: null,
  servings: null,
  ingredients: [{ name: "", optional: null }],
  directions: [{ text: "", image: null }],
  images: [],
  isVegetarian: null,
  isVegan: null,
  isGlutenFree: null,
  isDairyFree: null,
  isCheap: null,
  isHealthy: null,
  isLowFodmap: null,
  isHighProtein: null,
  isBreakfast: null,
  isLunch: null,
  isDinner: null,
  isDessert: null,
  isSnack: null,
}

export interface RecipeFormHandle {
  getValues: () => RecipeFormInputs
  isDirty: boolean
}

export interface RecipeFormProps {
  formValues?: RecipeFormInputs
  onSubmit: (formData: RecipeFormInputs) => void
  onError: (errors: any) => void
  isEdit?: boolean
  formRef?: React.MutableRefObject<RecipeFormHandle | null>
}

export const RecipeForm = observer(function RecipeForm(props: RecipeFormProps) {
  const { onSubmit, onError, formValues = defaultForm, isEdit = false, formRef } = props
  const { themed } = useAppTheme()
  const [isLoading, _] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const $themedButtonHeightOverride = React.useMemo(() => themed($buttonHeightOverride), [themed])
  const $themedDirectionItemContainer = React.useMemo(
    () => themed($directionItemContainer),
    [themed],
  )
  const $themedDirectionIndex = React.useMemo(() => themed($directionIndex), [themed])
  const $themedTextFieldContainer = React.useMemo(() => themed($textFieldContainer), [themed])

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    getValues,
  } = useForm<RecipeFormInputs>({
    resolver: yupResolver(recipeSchema),
    mode: "onSubmit",
    defaultValues: formValues,
  })

  // Keep formRef in sync so the parent can read current values and dirty state
  // (including inside useEffect cleanup callbacks on unmount)
  if (formRef) {
    formRef.current = { getValues, isDirty }
  }

  const currentImages = watch("images") ?? []

  // Map uploaded key → local file URI so we can display new images before save (keys are not full URLs)
  const [newImageKeysToLocalUri, setNewImageKeysToLocalUri] = useState<Record<string, string>>({})
  const [uploadingDirectionIndex, setUploadingDirectionIndex] = useState<number | null>(null)

  const pickDirectionImage = async (directionIndex: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert(translate("recipeFormScreen:allowCameraRollAccess"))
      return
    }

    setUploadingDirectionIndex(directionIndex)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uploadResponse = await api.uploadImage(result.assets)
        if (uploadResponse.kind === "ok" && uploadResponse.keys.length > 0) {
          const key = uploadResponse.keys[0]
          setValue(`directions.${directionIndex}.image`, key)
          if (result.assets[0]?.uri) {
            setNewImageKeysToLocalUri((prev) => ({ ...prev, [key]: result.assets[0].uri }))
          }
        } else {
          alert(translate("recipeFormScreen:imageUploadFailed"))
        }
      }
    } finally {
      setUploadingDirectionIndex(null)
    }
  }

  const removeDirectionImage = (directionIndex: number) => {
    setValue(`directions.${directionIndex}.image`, null)
  }

  useHeader({
    titleTx: isEdit ? "recipeListScreen:edit" : "recipeListScreen:add",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightTx: "common:save",
    onRightPress: () => handleSubmit(onSubmit, onError)(),
  })

  const {
    fields: ingredientFields,
    append: addIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" })

  const {
    fields: directionFields,
    append: addDirection,
    remove: removeDirection,
  } = useFieldArray({ control, name: "directions" })

  const removeImage = (index: number) => {
    const next = currentImages.filter((_, i) => i !== index)
    setValue("images", next)
  }

  const getImageDisplayUri = (uriOrKey: string) => newImageKeysToLocalUri[uriOrKey] ?? uriOrKey

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert(translate("recipeFormScreen:allowCameraRollAccess"))
      return
    }

    setIsUploading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uploadResponse = await api.uploadImage(result.assets)
        if (uploadResponse.kind === "ok") {
          const existing = isEdit ? (getValues("images") ?? []) : []
          const combined = [...existing, ...uploadResponse.keys].slice(0, 6)
          setValue("images", combined)
          const keyToUri: Record<string, string> = {}
          uploadResponse.keys.forEach((key, i) => {
            if (result.assets[i]?.uri) keyToUri[key] = result.assets[i].uri
          })
          setNewImageKeysToLocalUri((prev) => ({ ...prev, ...keyToUri }))
        } else {
          alert(translate("recipeFormScreen:imageUploadFailed"))
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View>
      <UseCase
        description={
          isEdit
            ? translate("recipeFormScreen:descriptionEdit")
            : translate("recipeFormScreen:descriptionNew")
        }
      >
        {isUploading && <ActivityIndicator />}
        {currentImages.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {currentImages.map((imageUri, index) => (
              <View key={index} style={{ margin: 5 }}>
                <AutoImage
                  source={{ uri: getImageDisplayUri(imageUri) }}
                  style={{ width: 100, height: 100 }}
                />
                <View
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 12,
                    padding: 2,
                  }}
                >
                  <PressableIcon icon="x" onPress={() => removeImage(index)} color="#fff" />
                </View>
              </View>
            ))}
          </View>
        )}

        <Button
          text={
            isEdit
              ? translate("recipeFormScreen:addPhotos", { current: currentImages.length })
              : translate("recipeFormScreen:addPhotosMax")
          }
          onPress={pickImage}
          disabled={isUploading || currentImages.length >= 6}
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"title"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value}
              onChangeText={onChange}
              placeholderTx="recipeFormScreen:titlePlaceholder"
              labelTx="recipeFormScreen:titleLabel"
              status="error"
              helper={errors.title?.message ?? ""}
            />
          )}
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"summary"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value ?? ""}
              onChangeText={onChange}
              helper={errors.summary?.message ?? ""}
              placeholderTx="recipeFormScreen:summaryPlaceholder"
              labelTx="recipeFormScreen:summaryLabel"
              status="error"
              multiline
              maxLength={2048}
            />
          )}
        />

        <Divider size={spacing.xxl} line />

        <Controller
          name={"preparationTimeInMinutes"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.preparationTimeInMinutes?.message ?? ""}
              placeholderTx="recipeFormScreen:zeroPlaceholder"
              status="error"
              labelTx="recipeFormScreen:prepLabel"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"cookingTimeInMinutes"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.cookingTimeInMinutes?.message ?? ""}
              placeholderTx="recipeFormScreen:zeroPlaceholder"
              status="error"
              labelTx="recipeFormScreen:cookLabel"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"bakingTimeInMinutes"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.bakingTimeInMinutes?.message ?? ""}
              placeholderTx="recipeFormScreen:zeroPlaceholder"
              status="error"
              labelTx="recipeFormScreen:bakeLabel"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"servings"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.servings?.message ?? ""}
              placeholderTx="recipeFormScreen:zeroPlaceholder"
              status="error"
              labelTx="recipeFormScreen:servingsLabel"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <Divider size={spacing.xxl} line />

        {/* Ingredients Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <Text tx="recipeDetailsScreen:ingredients" preset="bold" />
          {errors.ingredients?.message && (
            <Text text={errors.ingredients.message} style={{ color: "red" }} />
          )}
          <Divider size={spacing.md} />
          {ingredientFields.map((item, index) => (
            <View key={item.id || String(index)}>
              {index > 0 && <Divider size={spacing.sm} />}
              <View style={$themedDirectionItemContainer}>
                <Text text={"-"} style={$themedDirectionIndex} />
                <Controller
                  control={control}
                  name={`ingredients.${index}.name`}
                  render={({ field }) => (
                    <TextField
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholderTx="recipeFormScreen:ingredientPlaceholder"
                      containerStyle={$themedTextFieldContainer}
                      status="error"
                      helper={errors.ingredients?.[index]?.name?.message ?? ""}
                      maxLength={255}
                      RightAccessory={() => (
                        <PressableIcon icon="x" onPress={() => removeIngredient(index)} />
                      )}
                    />
                  )}
                />
              </View>
              {errors.ingredients?.[index]?.name?.message && (
                <Text
                  text={errors.ingredients[index].name.message}
                  style={[$errorText, { marginLeft: spacing.xl }]}
                />
              )}
            </View>
          ))}
          <Divider size={spacing.md} />
          <Button
            tx="recipeFormScreen:addAnotherIngredient"
            onPress={() => addIngredient({ name: "", optional: false })}
            style={$themedButtonHeightOverride}
            disabled={ingredientFields.length >= 40}
          />
          <Divider size={spacing.xl} />
        </View>

        {/* Directions Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <Text tx="recipeDetailsScreen:directions" preset="bold" />
          {errors.directions?.message && (
            <Text text={errors.directions.message} style={{ color: "red" }} />
          )}
          <Divider size={spacing.md} />
          {directionFields.map((item, index) => {
            const directionImage = watch(`directions.${index}.image`)
            const directionImageUri = directionImage ? getImageDisplayUri(directionImage) : null
            return (
              <View key={item.id || String(index)}>
                {index > 0 && <Divider size={spacing.sm} />}
                <View style={$themedDirectionItemContainer}>
                  <Text text={`${index + 1}.`} style={$themedDirectionIndex} />
                  <Controller
                    control={control}
                    name={`directions.${index}.text`}
                    render={({ field }) => (
                      <TextField
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholderTx="recipeFormScreen:directionPlaceholder"
                        containerStyle={$themedTextFieldContainer}
                        helper={errors.directions?.[index]?.text?.message ?? ""}
                        status="error"
                        maxLength={2048}
                        multiline
                        RightAccessory={() => (
                          <View style={$directionAccessoryRow}>
                            <PressableIcon
                              icon="camera"
                              onPress={() => pickDirectionImage(index)}
                              size={20}
                            />
                            <PressableIcon icon="x" onPress={() => removeDirection(index)} />
                          </View>
                        )}
                      />
                    )}
                  />
                </View>
                {uploadingDirectionIndex === index && (
                  <ActivityIndicator style={{ marginLeft: spacing.xl }} />
                )}
                {directionImageUri && (
                  <View style={$directionImagePreviewContainer}>
                    <AutoImage
                      source={{ uri: directionImageUri }}
                      style={$directionImagePreview as ImageStyle}
                    />
                    <View style={$directionImageRemoveButton}>
                      <PressableIcon
                        icon="x"
                        onPress={() => removeDirectionImage(index)}
                        color="#fff"
                        size={14}
                      />
                    </View>
                  </View>
                )}
                {errors.directions?.[index]?.text?.message && (
                  <Text
                    text={errors.directions[index].text.message}
                    style={[$errorText, { marginLeft: spacing.xl }]}
                  />
                )}
              </View>
            )
          })}
          <Divider size={spacing.md} />
          <Button
            tx="recipeFormScreen:addAnotherDirection"
            onPress={() => addDirection({ text: "", image: null })}
            style={$themedButtonHeightOverride}
            disabled={directionFields.length >= 20}
          />
          <Divider size={spacing.xl} />
        </View>

        {/* Tags Section */}
        <View>
          <Text tx="recipeFormScreen:tagsLabel" preset="bold" />
          <Divider size={spacing.md} />
          <View style={$tagRow}>
            {RECIPE_TAGS.map(({ key, labelTx }) => (
              <Controller
                key={key}
                control={control}
                name={key}
                render={({ field: { value, onChange } }) => (
                  <TouchableOpacity
                    onPress={() => onChange(value === true ? null : true)}
                    style={[themed($tagChip), value === true && themed($tagChipActive)]}
                  >
                    <Text
                      tx={labelTx}
                      style={themed(value === true ? $tagChipTextActive : $tagChipText)}
                    />
                  </TouchableOpacity>
                )}
              />
            ))}
          </View>
          <Divider size={spacing.xl} />
        </View>

        {isLoading && <ActivityIndicator />}
      </UseCase>
    </View>
  )
})

const $buttonHeightOverride: ThemedStyle<ViewStyle> = (theme) => ({
  minHeight: theme.spacing.md,
})

const $directionItemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
})

const $directionIndex: ThemedStyle<TextStyle> = (theme) => ({
  marginRight: theme.spacing.sm,
})

const $textFieldContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  minHeight: 50,
})

const $directionAccessoryRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}

const $directionImagePreviewContainer: ViewStyle = {
  marginLeft: spacing.xl,
  marginTop: spacing.xs,
  alignSelf: "flex-start",
}

const $directionImagePreview: ImageStyle = {
  width: 80,
  height: 80,
  borderRadius: 8,
}

const $directionImageRemoveButton: ViewStyle = {
  position: "absolute",
  top: 2,
  right: 2,
  backgroundColor: "rgba(0,0,0,0.5)",
  borderRadius: 10,
  padding: 2,
}

const $errorText: TextStyle = {
  color: "red",
  fontSize: 12,
  marginTop: 4,
}

const RECIPE_TAGS: {
  key: keyof Pick<
    RecipeFormInputs,
    | "isVegetarian"
    | "isVegan"
    | "isGlutenFree"
    | "isDairyFree"
    | "isCheap"
    | "isHealthy"
    | "isLowFodmap"
    | "isHighProtein"
    | "isBreakfast"
    | "isLunch"
    | "isDinner"
    | "isDessert"
    | "isSnack"
  >
  labelTx: Parameters<typeof Text>[0]["tx"]
}[] = [
  { key: "isVegetarian", labelTx: "recipeTags:isVegetarian" },
  { key: "isVegan", labelTx: "recipeTags:isVegan" },
  { key: "isGlutenFree", labelTx: "recipeTags:isGlutenFree" },
  { key: "isDairyFree", labelTx: "recipeTags:isDairyFree" },
  { key: "isCheap", labelTx: "recipeTags:isCheap" },
  { key: "isHealthy", labelTx: "recipeTags:isHealthy" },
  { key: "isLowFodmap", labelTx: "recipeTags:isLowFodmap" },
  { key: "isHighProtein", labelTx: "recipeTags:isHighProtein" },
  { key: "isBreakfast", labelTx: "recipeTags:isBreakfast" },
  { key: "isLunch", labelTx: "recipeTags:isLunch" },
  { key: "isDinner", labelTx: "recipeTags:isDinner" },
  { key: "isDessert", labelTx: "recipeTags:isDessert" },
  { key: "isSnack", labelTx: "recipeTags:isSnack" },
]

const $tagRow: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
}

const $tagChip: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 1,
  borderColor: theme.colors.separator,
  borderRadius: theme.spacing.xl,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs,
  backgroundColor: theme.colors.background,
})

const $tagChipActive: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.tint,
  backgroundColor: theme.colors.tint,
})

const $tagChipText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 13,
})

const $tagChipTextActive: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
  fontSize: 13,
})
