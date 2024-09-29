import { Button, TextField, Text, Screen, Icon, ListView } from "app/components"
import { spacing } from "app/theme"
import React, { FC, useState } from "react"
import { View, ViewStyle } from "react-native"
import { DemoUseCase } from "../DemoShowroomScreen/DemoUseCase"
import { DemoDivider } from "../DemoShowroomScreen/DemoDivider"
import { RecipeToAddSnapshotIn } from "app/models/Recipe"
import { useStores } from "app/models"
import { DemoTabScreenProps } from "app/navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"



export const AddRecipeScreen: FC<DemoTabScreenProps<"AddRecipe">> = observer(
  function AddRecipeScreen(_props) {
    const [directions, setDirections] = useState([""])
    const [ingredients, setIngredients] = useState([""])
    const { recipeStore } = useStores()


    const handleAddDirection = () => {
      setDirections([...directions, ""])
    }

    const handleDirectionChange = (index: number, value: string) => {
      const updatedDirections = [...directions]
      updatedDirections[index] = value
      setDirections(updatedDirections)
    }

    const handleRemoveDirection = (index: number) => {
      const updatedDirections = directions.filter((_, i) => i !== index)
      setDirections(updatedDirections)
    }

    const handleAddIngredient = () => {
      setIngredients([...ingredients, ""])
    }

    const handleIngredientChange = (index: number, value: string) => {
      const updatedIngredients = [...ingredients]
      updatedIngredients[index] = value
      setIngredients(updatedIngredients)
    }

    const handleRemoveIngredient = (index: number) => {
      const updatedIngredients = ingredients.filter((_, i) => i !== index)
      setIngredients(updatedIngredients)
    }

    const schema = yup.object().shape({
      title: yup.string().required("Title is required").min(3, "Title at least 3 characters").max(255, "Title at most 255 characters"),
      summary: yup.string().nullable().min(3).max(255),
      preparationTimeInMinutes: yup.number().nullable().min(0).max(999, "Cannot exceed 1k"),
      cookingTimeInMinutes: yup.number().nullable().min(0).max(999, "Cannot exceed 1k"),
      bakingTimeInMinutes: yup.number().nullable().min(0).max(999, "Cannot exceed 1k"),
      servings: yup.number().nullable().min(0).max(999),
      ingredients: yup.array().of(yup.string().required("Ingredient is required").min(3).max(255)).min(1, "Ingredients are required"),
      directions: yup.array().of(yup.string().required("Direction is required").min(3).max(255)).min(1, "Directions are required"),
    })
    const {
      control,
      handleSubmit,
      formState: {errors},
    } = useForm({
      resolver: yupResolver(schema),
      mode: "onChange",
      defaultValues: {
        title: '',
        summary: null,
        preparationTimeInMinutes: null,
        cookingTimeInMinutes: null,
        bakingTimeInMinutes: null,
        servings: null,
        ingredients: [''],
        directions: [''],
      },
    })

    const onPressSend = (formData: any) => {
      const newRecipe: RecipeToAddSnapshotIn = {
        title: formData.title.trim(),
        cookbookId: _props.route.params.cookbookId, // Assuming cookbookId is passed in route params
        summary: formData.summary?.trim() || null,
        thumbnail: null, // TODO handle thumbnail logic
        videoPath: null, // TODO handle videoPath logic
        preparationTimeInMinutes: formData.preparationTimeInMinutes ? parseInt(formData.preparationTimeInMinutes) : null,
        cookingTimeInMinutes: formData.cookingTimeInMinutes ? parseInt(formData.cookingTimeInMinutes) : null,
        bakingTimeInMinutes: formData.bakingTimeInMinutes ? parseInt(formData.bakingTimeInMinutes) : null,
        servings: formData.servings ? parseInt(formData.servings) : null,
        directions: directions.map((dir, index) => ({
          id: 0,
          text: dir,
          ordinal: index + 1,
          image: null,
        })),
        ingredients: ingredients.map((ing, index) => ({
          id: 0,
          name: ing,
          optional: false,
          ordinal: index + 1,
        })),      
        images: [],  // TODO handle images logic
      };
    
      //recipeStore.createRecipe(newRecipe);
      console.debug(JSON.stringify(newRecipe, null, 2))
    
      console.debug("Form submitted: ", newRecipe);
    };
    

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
          onPress={() => {handleSubmit(onPressSend)()}}
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
                  onPress={handleAddIngredient}
                  style={$buttonHeightOverride}
                />
                <DemoDivider size={spacing.xl} />
              </View>
            }
            estimatedItemSize={162}
            data={ingredients}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={$directionItemContainer}>
                <Text 
                  text={'-'}
                  style={$directionIndex}
                />
                <TextField
                  value={item}
                  onChangeText={(value) => handleIngredientChange(index, value)}
                  placeholder={`Add ingredient here...`}
                  containerStyle={$textFieldContainer}
                  RightAccessory={() => (
                    <Icon 
                      icon="x"
                      onPress={() => handleRemoveIngredient(index)}
                    />
                  )}
                />
              </View>
            )}
            ItemSeparatorComponent={() => <DemoDivider size={spacing.sm} />}
          />
        </View>

        <View style={{minHeight: spacing.xxs}}>
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
                  onPress={handleAddDirection}
                  style={$buttonHeightOverride}
                />
                <DemoDivider size={spacing.xl} />
              </View>
            }
            estimatedItemSize={162}
            data={directions}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={$directionItemContainer}>
                <Text 
                  text={`${index + 1}.`}
                  style={$directionIndex}
                />
                <TextField
                  value={item}
                  onChangeText={(value) => handleDirectionChange(index, value)}
                  placeholder={`Add direction here...`}
                  containerStyle={$textFieldContainer}
                  multiline
                  RightAccessory={() => (
                    <Icon 
                      icon="x"
                      onPress={() => handleRemoveDirection(index)}
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