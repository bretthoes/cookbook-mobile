import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
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
import { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { ActivityIndicator, FlatList, TextStyle, View, ViewStyle } from "react-native"

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
}

export interface RecipeFormProps {
  formValues?: RecipeFormInputs
  onSubmit: (formData: RecipeFormInputs) => void
  onError: (errors: any) => void
  isEdit?: boolean
}

export const RecipeForm = observer(function RecipeForm(props: RecipeFormProps) {
  const { onSubmit, onError, formValues = defaultForm, isEdit = false } = props
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
    formState: { errors },
    setValue,
  } = useForm<RecipeFormInputs>({
    resolver: yupResolver(recipeSchema),
    mode: "onSubmit",
    defaultValues: formValues,
  })

  useHeader({
    titleTx: isEdit ? "recipeListScreen:edit" : "recipeListScreen:add",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightText: "Save",
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

  // Remove the S3_URL mapping since server provides full URLs
  const [imagesLocal, setImagesLocal] = useState(formValues.images || [])
  useEffect(() => {
    setImagesLocal(formValues.images || [])
  }, [formValues.images])

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("Please allow camera roll access in settings.")
      return
    }

    setIsUploading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        aspect: [1, 1],
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map((x) => x.uri)
        const combinedImages = [...newImages].slice(0, 6)

        setImagesLocal(combinedImages)

        const uploadResponse = await api.uploadImage(result.assets)
        if (uploadResponse.kind === "ok") {
          setValue("images", uploadResponse.keys.slice(0, 6))
        } else {
          alert("Image upload failed")
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
            ? "Swipe back to exit without saving."
            : "Fill out the details for your new recipe."
        }
      >
        {isUploading && <ActivityIndicator />}
        {imagesLocal.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {imagesLocal.map((imageUri, index) => (
              <AutoImage
                key={index}
                source={{ uri: imageUri }}
                style={{ width: 100, height: 100, margin: 5 }}
              />
            ))}
          </View>
        )}

        <Button
          text={isEdit ? "Replace existing photos (max of 6)" : "Add photos (max of 6)"}
          onPress={pickImage}
          disabled={isUploading}
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"title"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value}
              onChangeText={onChange}
              placeholder="Recipe title here..."
              label="Title"
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
              placeholder="Recipe summary here..."
              label="Summary (optional)"
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
              placeholder="0"
              status="error"
              label="Prep time minutes (optional)"
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
              placeholder="0"
              status="error"
              label="Cook time minutes (optional)"
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
              placeholder="0"
              status="error"
              label="Bake time minutes (optional)"
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
              placeholder="0"
              status="error"
              label="Servings (optional)"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <Divider size={spacing.xxl} line />

        {/* Ingredients Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <FlatList
            ListHeaderComponent={
              <View>
                <Text text="Ingredients" preset="bold" />
                {errors.ingredients?.message && (
                  <Text text={errors.ingredients.message} style={{ color: "red" }} />
                )}
                <Divider size={spacing.md} />
              </View>
            }
            ListFooterComponent={
              <View>
                <Divider size={spacing.md} />
                <Button
                  text="Add another ingredient"
                  onPress={() => addIngredient({ name: "", optional: false })}
                  style={$themedButtonHeightOverride}
                  disabled={ingredientFields.length >= 40}
                />
                <Divider size={spacing.xl} />
              </View>
            }
            data={ingredientFields}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={({ index }) => {
              const handleRemove = () => removeIngredient(index)
              return (
                <View>
                  <View style={$themedDirectionItemContainer}>
                    <Text text={"-"} style={$themedDirectionIndex} />
                    <Controller
                      control={control}
                      name={`ingredients.${index}.name`}
                      render={({ field }) => (
                        <TextField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="Add ingredient here..."
                          containerStyle={$themedTextFieldContainer}
                          status="error"
                          helper={errors.ingredients?.[index]?.name?.message ?? ""}
                          maxLength={255}
                          RightAccessory={() => <PressableIcon icon="x" onPress={handleRemove} />}
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
              )
            }}
            ItemSeparatorComponent={() => <Divider size={spacing.sm} />}
          />
        </View>

        {/* Directions Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <FlatList
            ListHeaderComponent={
              <View>
                <Text text="Directions" preset="bold" />
                {errors.directions?.message && (
                  <Text text={errors.directions.message} style={{ color: "red" }} />
                )}
                <Divider size={spacing.md} />
              </View>
            }
            ListFooterComponent={
              <View>
                <Divider size={spacing.md} />
                <Button
                  text="Add another direction"
                  onPress={() => addDirection({ text: "", image: "" })}
                  style={$themedButtonHeightOverride}
                  disabled={directionFields.length >= 20}
                />
                <Divider size={spacing.xl} />
              </View>
            }
            data={directionFields}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={({ index }) => {
              const handleRemove = () => removeDirection(index)
              return (
                <View>
                  <View style={$themedDirectionItemContainer}>
                    <Text text={`${index + 1}.`} style={$themedDirectionIndex} />
                    <Controller
                      control={control}
                      name={`directions.${index}.text`}
                      render={({ field }) => (
                        <TextField
                          value={field.value}
                          onChangeText={field.onChange}
                          placeholder="Add direction here..."
                          containerStyle={$themedTextFieldContainer}
                          helper={errors.directions?.[index]?.text?.message ?? ""}
                          status="error"
                          maxLength={2048}
                          multiline
                          RightAccessory={() => <PressableIcon icon="x" onPress={handleRemove} />}
                        />
                      )}
                    />
                  </View>
                  {errors.directions?.[index]?.text?.message && (
                    <Text
                      text={errors.directions[index].text.message}
                      style={[$errorText, { marginLeft: spacing.xl }]}
                    />
                  )}
                </View>
              )
            }}
            ItemSeparatorComponent={() => <Divider size={spacing.sm} />}
          />
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

const $errorText: TextStyle = {
  color: "red",
  fontSize: 12,
  marginTop: 4,
}
