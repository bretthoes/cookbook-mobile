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
import { validateSummary, validateText, validateTimeInMinutes } from "./validation"


export const AddRecipeScreen: FC<DemoTabScreenProps<"AddRecipe">> = observer(
  function AddRecipeScreen(_props) {
    const { recipeStore } = useStores()
    const [titleInput, setTitleInput] = useState("")
    const [summaryInput, setSummaryInput] = useState("")
    const [prepTimeInput, setPrepTimeInput] = useState("")
    const [cookTimeInput, setCookTimeInput] = useState("")
    const [bakeTimeInput, setBakeTimeInput] = useState("")
    const [servingsInput, setServingsInput] = useState("")

    const [directions, setDirections] = useState([""])
    const [ingredients, setIngredients] = useState([""])
    
    const handleSaveRecipe = () => {
      const newRecipe: RecipeToAddSnapshotIn = {
        title: titleInput.trim(),
        cookbookId: _props.route.params.cookbookId,
        summary: summaryInput.trim() || null,
        thumbnail: null, // TODO handle thumbnail logic
        videoPath: null, // TODO handle videoPath logic
        preparationTimeInMinutes: prepTimeInput ? parseInt(prepTimeInput) : null,
        cookingTimeInMinutes: cookTimeInput ? parseInt(cookTimeInput) : null,
        bakingTimeInMinutes: bakeTimeInput ? parseInt(bakeTimeInput) : null,
        servings: servingsInput ? parseInt(servingsInput) : null,
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
      }

      recipeStore.createRecipe(newRecipe);
    }

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
          onPress={handleSaveRecipe}
        />
      </View>

      <DemoUseCase
        name=""
        description="Fill out the details for your new recipe."
      >
        <TextField
            value={titleInput}
            onChangeText={setTitleInput}
            placeholder="Enter recipe title"
            validation={validateText}
        />

        <DemoDivider size={spacing.lg} />

        <TextField
          value={summaryInput}
          onChangeText={setSummaryInput}
          placeholder="Enter summary (optional)"
          validation={validateSummary}
          multiline
        />

        <DemoDivider size={spacing.xxl} line />

        <TextField
          value={prepTimeInput}
          onChangeText={setPrepTimeInput}
          placeholder="Prep time in minutes (optional)"
          validation={validateTimeInMinutes}
          inputMode="numeric"
          keyboardType="numeric"
        />

        <DemoDivider size={spacing.lg} />

        <TextField
          value={cookTimeInput}
          onChangeText={setCookTimeInput}
          placeholder="Cook time in minutes (optional)"
          validation={validateTimeInMinutes}
          inputMode="numeric"
          keyboardType="numeric"
        />

        <DemoDivider size={spacing.lg} />

        <TextField
          value={bakeTimeInput}
          onChangeText={setBakeTimeInput}
          placeholder="Bake time in minutes (optional)"
          validation={validateTimeInMinutes}
          inputMode="numeric"
          keyboardType="numeric"
        />

        <DemoDivider size={spacing.lg} />

        <TextField
          value={servingsInput}
          onChangeText={setServingsInput}
          placeholder="Servings (optional)"
          validation={validateTimeInMinutes}
          inputMode="numeric"
          keyboardType="numeric"
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
                  validation={validateText}
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