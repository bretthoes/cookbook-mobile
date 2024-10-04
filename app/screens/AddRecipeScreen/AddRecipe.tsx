import { Button, TextField, Text, Screen, Icon, ListView } from "app/components"
import { spacing } from "app/theme"
import React, { FC } from "react"
import { View, ViewStyle } from "react-native"
import { DemoUseCase } from "../DemoShowroomScreen/DemoUseCase"
import { DemoDivider } from "../DemoShowroomScreen/DemoDivider"
import { RecipeToAddSnapshotIn } from "app/models/Recipe"
import { useStores } from "app/models"
import { DemoTabScreenProps } from "app/navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import * as yup from "yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"

interface RecipeFormInputs {
  title: string
  summary: string | null
  preparationTimeInMinutes: number | null
  cookingTimeInMinutes: number | null
  bakingTimeInMinutes: number | null
  servings: number | null
  ingredients: {
    name: string,
    optional: boolean | null
  }[]
  directions: {
    text: string,
    image: string | null
  }[]
}

export const AddRecipeScreen: FC<DemoTabScreenProps<"AddRecipe">> = observer(
  function AddRecipeScreen(_props) {
    const { recipeStore } = useStores()

    const schema = yup.object().shape({
      title: yup.string().required("Title is required").min(3, "Title at least 3 characters").max(255, "Title at most 255 characters"),
      summary: yup.string().nullable().defined().min(3).max(255), // Matches RecipeFormInputs
      preparationTimeInMinutes: yup.number().nullable().defined().min(0).max(999, "Cannot exceed 1k"), // Matches RecipeFormInputs
      cookingTimeInMinutes: yup.number().nullable().defined().min(0).max(999, "Cannot exceed 1k"), // Matches RecipeFormInputs
      bakingTimeInMinutes: yup.number().nullable().defined().min(0).max(999, "Cannot exceed 1k"), // Matches RecipeFormInputs
      servings: yup.number().nullable().defined().min(0).max(999), // Matches RecipeFormInputs
      ingredients: yup.array().required().of(
        yup.object({
          name: yup.string().required("Ingredient is required").min(3, "Ingredient at least 3 characters").max(255, "Ingredient at most 255 characters"),
          optional: yup.bool().nullable().defined().default(false),
        })
      ).min(1, "At least one ingredient is required").default([]),
      directions: yup.array().required().of(
        yup.object({
          text: yup.string().required("Direction is required").min(3, "Direction at least 3 characters").max(255, "Direction at most 255 characters"),
          image: yup.string().nullable().defined()
        })
      ).min(1, "At least one direction is required").default([]),
    })

    const {
      control,
      handleSubmit,
      formState: { errors },
    } = useForm<RecipeFormInputs>({
      resolver: yupResolver(schema),
      mode: "onChange",
      defaultValues: {
        title: '',
        summary: null,
        preparationTimeInMinutes: null,
        cookingTimeInMinutes: null,
        bakingTimeInMinutes: null,
        servings: null,
        ingredients: [],
        directions: [],
      },
    })
    

    const { fields: ingredientFields, append: addIngredient, remove: removeIngredient } = useFieldArray({
      control,
      name: "ingredients"
    })

    const { fields: directionFields, append: addDirection, remove: removeDirection } = useFieldArray({
      control,
      name: "directions"
    })


    const onPressSend = (formData: RecipeFormInputs) => {
      console.debug("Form submitted successfully")
      console.debug(JSON.stringify(formData, null, 2))
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
        directions: formData.directions.map((dir, index) => ({
          id: 0,
          text: dir.text,
          ordinal: index + 1,
          image: null,
        })),
        ingredients: formData.ingredients.map((ing, index) => ({
          id: 0,
          name: ing.name,
          optional: false,
          ordinal: index + 1,
        })),          
        images: [],  // TODO handle images logic
      }
      console.debug(JSON.stringify(newRecipe, null, 2))
      //recipeStore.createRecipe(newRecipe)
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
        <Text 
          preset="heading"
          weight="normal"
          text="Add new recipe"
        />
        <Button
          text="Save"
          style={$buttonHeightOverride}
          onPress={handleSubmit(onPressSend, onError)}
        />
      </View>

      <DemoUseCase
        name=""
        description="Fill out the details for your new recipe."
      >
        <Controller
          name={"title"}
          control={control}
          render={({field: {onChange, value}}) => (
          <TextField
            value={value}
            onChangeText={onChange}
            placeholder="Enter recipe title"
            helper={errors.title?.message ?? ""}
          />
          )}
        />

        <DemoDivider size={spacing.lg} />

        <Controller 
          name={"summary"}
          control={control}
          render={({field: {onChange, value}}) => (
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
          render={({field: {onChange, value}}) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.summary?.message ?? ""}
              placeholder="Prep time in minutes (optional)"
              inputMode="numeric"
              keyboardType="numeric"
              multiline
            />
          )}
        />

        <DemoDivider size={spacing.lg} />

        <Controller 
          name={"cookingTimeInMinutes"}
          control={control}
          render={({field: {onChange, value}}) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.summary?.message ?? ""}
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
          render={({field: {onChange, value}}) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.summary?.message ?? ""}
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
          render={({field: {onChange, value}}) => (
            <TextField
              value={value ? String(value) : ""}
              onChangeText={onChange}
              helper={errors.summary?.message ?? ""}
              placeholder="Servings (optional)"
              inputMode="numeric"
              keyboardType="numeric"
            />
          )}
        />

        <DemoDivider size={spacing.xxl} line />

        {/* Ingredients Section */}
        <View style={{minHeight: spacing.xxs}}>
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
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={$directionItemContainer}>
                <Text 
                  text={'-'}
                  style={$directionIndex}
                />
                <Controller
                    control={control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <TextField
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder="Add ingredient here..."
                        containerStyle={$textFieldContainer}
                        RightAccessory={() => (
                          <Icon 
                            icon="x"
                            onPress={() => removeIngredient(index)}
                          />
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
            keyExtractor={(item, index) => item.id}
            renderItem={({ item, index }) => (
              <View style={$directionItemContainer}>
                <Text 
                  text={`${index + 1}.`}
                  style={$directionIndex}
                />
                <Controller
                  control={control}
                  name={`directions.${index}.text`}
                  render={({ field }) => (
                    <TextField
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Add direction here..."
                      containerStyle={$textFieldContainer}
                      multiline
                      RightAccessory={() => (
                        <Icon 
                          icon="x"
                          onPress={() => removeDirection(index)}
                        />
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
  }
)

// #region Styles
const $screenContentContainer: ViewStyle = {
  marginHorizontal: spacing.md,
  marginTop: spacing.xl,
}

const $titleContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
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