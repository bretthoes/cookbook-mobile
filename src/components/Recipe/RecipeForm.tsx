import * as React from "react"
import { View, ViewStyle, TextStyle } from "react-native"
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
import { useHeader } from "src/utils/useHeader"
import { router } from "expo-router"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

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

  const $themedButtonHeightOverride = React.useMemo(() => themed($buttonHeightOverride), [themed])
  const $themedDirectionItemContainer = React.useMemo(() => themed($directionItemContainer), [themed])
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
    <View>
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

        <Text text="Hint: You cannot leave ingredients or directions empty!" preset="formHelper" />
        <Divider size={spacing.xxl} line />

        {/* Ingredients Section */}
        <View style={{ minHeight: spacing.xxs }}>
          <ListView
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
            estimatedItemSize={162}
            data={ingredientFields}
            renderItem={({ index }) => (
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
                        RightAccessory={() => (
                          <Icon icon="x" onPress={() => removeIngredient(index)} />
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
            estimatedItemSize={162}
            data={directionFields}
            renderItem={({ index }) => (
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
                        RightAccessory={() => (
                          <Icon icon="x" onPress={() => removeDirection(index)} />
                        )}
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
            )}
            ItemSeparatorComponent={() => <Divider size={spacing.sm} />}
          />
        </View>
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

const $directionIndex: ThemedStyle<ViewStyle> = (theme) => ({
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
