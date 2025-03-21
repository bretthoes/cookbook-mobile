import * as React from "react"
import { View, ViewStyle } from "react-native"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { observer } from "mobx-react-lite"
import { recipeSchema } from "src/validators/recipeSchema"
import { Text } from "src/components/Text"
import { TextField } from "src/components/TextField"
import { Button } from "src/components/Button"
import * as ImagePicker from "expo-image-picker"
import { useEffect, useState } from "react"
import { api } from "src/services/api"
import { AutoImage } from "src/components/AutoImage"
import { Divider } from "src/components/Divider"
import { spacing } from "src/theme"
import { Icon } from "src/components/Icon"
import { ListView } from "src/components/ListView"
import { UseCase } from "src/components/UseCase"
import Config from "src/config"

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RecipeFormInputs>({
    resolver: yupResolver(recipeSchema),
    mode: "onChange",
    defaultValues: formValues,
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

  // Ugly way around conditionally displaying remote or local images
  const [imagesLocal, setImagesLocal] = useState(
    formValues.images?.map((img) => (img.startsWith("http") ? img : `${Config.S3_URL}/${img}`)) ||
      [],
  )
  useEffect(() => {
    setImagesLocal(
      formValues.images?.map((img) => (img.startsWith("http") ? img : `${Config.S3_URL}/${img}`)) ||
        [],
    )
  }, [formValues.images])

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("Please allow camera roll access in settings.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // NOTE: This can not be used with option that allows cropping (allowsEditing)
      aspect: [1, 1],
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = result.assets.map((x) => x.uri)
      const combinedImages = [...newImages].slice(0, 6) // Replace existing with new images (up to 6)

      setImagesLocal(combinedImages) // Update local state for display

      const uploadResponse = await api.uploadImage(result.assets)
      if (uploadResponse.kind === "ok") {
        setValue("images", uploadResponse.keys.slice(0, 6)) // Only set new images, discarding old ones
      } else {
        alert("Image upload failed")
      }
    }
  }

  return (
    <>
      <View style={$titleContainer}>
        <Text
          preset="heading"
          weight="normal"
          tx={isEdit ? "recipeListScreen:edit" : "recipeListScreen:add"}
        />
        <Button
          text="Save"
          style={$buttonHeightOverride}
          onPress={handleSubmit(onSubmit, onError)}
        />
      </View>
      <UseCase
        name=""
        description={
          isEdit
            ? "Swipe back to exit without saving."
            : "Fill out the details for your new recipe."
        }
      >
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
        />

        <Divider size={spacing.lg} />

        <Controller
          name={"title"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value}
              onChangeText={onChange}
              placeholder="Enter recipe title"
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
              placeholder="Enter summary (optional)"
              multiline
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
              placeholder="Prep time in minutes (optional)"
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
              placeholder="Cook time in minutes (optional)"
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
              placeholder="Bake time in minutes (optional)"
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
              placeholder="Servings (optional)"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <Divider size={spacing.xxl} line />

        {/* Ingredients Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <ListView
            ListHeaderComponent={
              <View>
                <Text text="Ingredients" preset="bold" />
                <Divider size={spacing.md} />
              </View>
            }
            ListFooterComponent={
              <View>
                <Divider size={spacing.md} />
                <Button
                  text="Add another ingredient"
                  onPress={() => addIngredient({ name: "", optional: false })}
                  style={$buttonHeightOverride}
                />
                <Divider size={spacing.xl} />
              </View>
            }
            estimatedItemSize={162}
            data={ingredientFields}
            renderItem={({ index }) => (
              <View style={$directionItemContainer}>
                <Text text={"-"} style={$directionIndex} />
                <Controller
                  control={control}
                  name={`ingredients.${index}.name`}
                  render={({ field }) => (
                    <TextField
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Add ingredient here..."
                      containerStyle={$textFieldContainer}
                      status="error"
                      helper={errors.ingredients?.[index]?.name?.message ?? ""}
                      maxLength={255}
                      RightAccessory={() => (
                        <Icon icon="x" onPress={() => removeIngredient(index)} />
                      )}
                    />
                  )}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <Divider size={spacing.sm} />}
          />
        </View>

        {/* Directions Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <ListView
            ListHeaderComponent={
              <View>
                <Text text="Directions" preset="bold" />
                <Divider size={spacing.md} />
              </View>
            }
            ListFooterComponent={
              <View>
                <Divider size={spacing.md} />
                <Button
                  text="Add another direction"
                  onPress={() => addDirection({ text: "", image: "" })}
                  style={$buttonHeightOverride}
                />
                <Divider size={spacing.xl} />
              </View>
            }
            estimatedItemSize={162}
            data={directionFields}
            renderItem={({ index }) => (
              <View style={$directionItemContainer}>
                <Text text={`${index + 1}.`} style={$directionIndex} />
                <Controller
                  control={control}
                  name={`directions.${index}.text`}
                  render={({ field }) => (
                    <TextField
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Add direction here..."
                      containerStyle={$textFieldContainer}
                      helper={errors.directions?.[index]?.text?.message ?? ""}
                      status="error"
                      maxLength={255}
                      multiline
                      RightAccessory={() => (
                        <Icon icon="x" onPress={() => removeDirection(index)} />
                      )}
                    />
                  )}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <Divider size={spacing.sm} />}
          />
        </View>
      </UseCase>
    </>
  )
})

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $buttonHeightOverride: ViewStyle = {
  minHeight: spacing.md,
}

const $directionItemContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
}

const $directionIndex: ViewStyle = {
  marginRight: spacing.sm,
}

const $textFieldContainer: ViewStyle = {
  flex: 1,
  minHeight: 50,
}
