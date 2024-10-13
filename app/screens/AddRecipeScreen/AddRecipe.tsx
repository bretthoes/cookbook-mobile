import { Button, TextField, Text, Screen, Icon, ListView, AutoImage } from "app/components"
import { spacing } from "app/theme"
import React, { FC, useState } from "react"
import { View, ViewStyle } from "react-native"
import { DemoUseCase } from "../DemoShowroomScreen/DemoUseCase"
import { DemoDivider } from "../DemoShowroomScreen/DemoDivider"
import { RecipeToAddSnapshotIn } from "app/models/Recipe"
import { useStores } from "app/models"
import { DemoTabScreenProps } from "app/navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import * as yup from "yup"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { api } from "app/services/api"

interface RecipeFormInputs {
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

export const AddRecipeScreen: FC<DemoTabScreenProps<"AddRecipe">> = observer(
  function AddRecipeScreen(_props) {
    const { recipeStore } = useStores()

    const schema = yup.object().shape({
      title: yup
        .string()
        .required("Title is required")
        .min(3, "Title at least 3 characters")
        .max(255, "Title at most 255 characters"),
      summary: yup
        .string()
        .nullable()
        .defined()
        .min(3, "Summary at least 3 characters")
        .max(255, "Summary at most 255 characters"),
      preparationTimeInMinutes: yup
        .number()
        .nullable()
        .defined()
        .min(0, "Must be greater than 0")
        .max(999, "Cannot exceed 1k"),
      cookingTimeInMinutes: yup
        .number()
        .nullable()
        .defined()
        .min(0, "Must be greater than 0")
        .max(999, "Cannot exceed 1k"),
      bakingTimeInMinutes: yup
        .number()
        .nullable()
        .defined()
        .min(0, "Must be greater than 0")
        .max(999, "Cannot exceed 1k"),
      servings: yup
        .number()
        .nullable()
        .defined()
        .min(0, "Must be greater than 0")
        .max(999, "Cannot exceed 1k"),
      ingredients: yup
        .array()
        .required()
        .of(
          yup.object({
            name: yup
              .string()
              .required("Ingredient is required")
              .min(3, "Ingredient at least 3 characters")
              .max(255, "Ingredient at most 255 characters"),
            optional: yup.bool().nullable().defined().default(false),
          }),
        )
        .min(1, "At least one ingredient is required"),
      directions: yup
        .array()
        .required()
        .of(
          yup.object({
            text: yup
              .string()
              .required("Direction is required")
              .min(3, "Direction at least 3 characters")
              .max(255, "Direction at most 255 characters"),
            image: yup.string().nullable().defined().default(null),
          }),
        )
        .min(1, "At least one direction is required"),
      images: yup.array().required().of(yup.string().required())
    })

    const {
      control,
      handleSubmit,
      formState: { errors },
      setValue,
    } = useForm<RecipeFormInputs>({
      resolver: yupResolver(schema),
      mode: "onChange",
      defaultValues: {
        title: "",
        summary: null,
        preparationTimeInMinutes: null,
        cookingTimeInMinutes: null,
        bakingTimeInMinutes: null,
        servings: null,
        ingredients: [{ name: "" }],
        directions: [{ text: "" }],
        images: [],
      },
    })

    const {
      fields: ingredientFields,
      append: addIngredient,
      remove: removeIngredient,
    } = useFieldArray({
      control,
      name: "ingredients",
    })

    const {
      fields: directionFields,
      append: addDirection,
      remove: removeDirection,
    } = useFieldArray({
      control,
      name: "directions",
    })

    const [imagesLocal, setImagesLocal] = useState([] as string[])


    // Image picker function
    const pickImage = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        alert('Please allow camera roll access in settings.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true, // NOTE: This can not be used with option that allows cropping (allowsEditing)
        aspect: [1, 1],
      })
      setImagesLocal(result.assets?.map(x => x.uri) ?? [])

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uploadResponse = await api.uploadImage(result.assets);
        if (uploadResponse.kind === "ok") {
          setValue("images", uploadResponse.keys);
        } else {
          alert("Image selection failed");
        }
      }
    }

    const onPressSend = (formData: RecipeFormInputs) => {
      const newRecipe: RecipeToAddSnapshotIn = {
        title: formData.title.trim(),
        cookbookId: _props.route.params.cookbookId,
        summary: formData.summary?.trim() || null,
        thumbnail: null, // TODO handle thumbnail logic
        videoPath: null, // TODO handle videoPath logic
        preparationTimeInMinutes: formData.preparationTimeInMinutes,
        cookingTimeInMinutes: formData.cookingTimeInMinutes,
        bakingTimeInMinutes: formData.bakingTimeInMinutes,
        servings: formData.servings,
        directions: formData.directions.map((direction, index) => ({
          id: 0,
          text: direction.text,
          ordinal: index + 1,
          image: null,
        })),
        ingredients: formData.ingredients.map((ingredient, index) => ({
          id: 0,
          name: ingredient.name,
          optional: false,
          ordinal: index + 1,
        })),
        images: formData.images.map((image, index) => ({
          id: 0,
          name: image,
          ordinal: index + 1,
        })),
      }
      
      recipeStore.createRecipe(newRecipe)
    }

    const onError = (errors: any) => {
      console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
    }

    return (
      <Screen
        preset="scroll"
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContentContainer}
      >
        <View style={$titleContainer}>
          <Text preset="heading" weight="normal" text="Add new recipe" />
          <Button
            text="Save"
            style={$buttonHeightOverride}
            onPress={handleSubmit(onPressSend, onError)}
          />
        </View>

        <DemoUseCase name="" description="Fill out the details for your new recipe.">

        {imagesLocal.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {imagesLocal.map((imageUri, index) => (
              <AutoImage
                key={index}
                source={{ uri: imageUri }} // Display each image using AutoImage
                style={{ width: 100, height: 100, margin: 5 }} // Set the image size and spacing
              />
            ))}
          </View>
        )}
        
          <Button text="Add photos (max of 6)" onPress={pickImage} />

          <DemoDivider size={spacing.lg} />

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

          <DemoDivider size={spacing.lg} />

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

          <DemoDivider size={spacing.xxl} line />

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

          <DemoDivider size={spacing.lg} />

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

          <DemoDivider size={spacing.lg} />

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

          <DemoDivider size={spacing.lg} />

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

          <DemoDivider size={spacing.xxl} line />

          {/* Ingredients Section */}
          <View style={{ minHeight: spacing.xxs }}>
            <ListView
              ListHeaderComponent={
                <View>
                  <Text text="Ingredients" preset="bold" />
                  <DemoDivider size={spacing.md} />
                </View>
              }
              ListFooterComponent={
                <View>
                  <DemoDivider size={spacing.md} />
                  <Button
                    text="Add another ingredient"
                    onPress={() => addIngredient({ name: "", optional: false })}
                    style={$buttonHeightOverride}
                  />
                  <DemoDivider size={spacing.xl} />
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
              ItemSeparatorComponent={() => <DemoDivider size={spacing.sm} />}
            />
          </View>

          {/* Directions Section */}
          <View style={{ minHeight: spacing.xxs }}>
            <ListView
              ListHeaderComponent={
                <View>
                  <Text text="Directions" preset="bold" />
                  <DemoDivider size={spacing.md} />
                </View>
              }
              ListFooterComponent={
                <View>
                  <DemoDivider size={spacing.md} />
                  <Button
                    text="Add another direction"
                    onPress={() => addDirection({ text: "", image: "" })}
                    style={$buttonHeightOverride}
                  />
                  <DemoDivider size={spacing.xl} />
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
              ItemSeparatorComponent={() => <DemoDivider size={spacing.sm} />}
            />
          </View>
        </DemoUseCase>
      </Screen>
    )
  },
)

// #region Styles
const $screenContentContainer: ViewStyle = {
  marginHorizontal: spacing.md,
  marginTop: spacing.xl,
}

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
// #endregion
