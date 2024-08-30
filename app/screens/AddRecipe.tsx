import React from "react"
import { View, Text, TextInput, Button } from "react-native"

// TODO implement
export const AddRecipeScreen = () => {
  return (
    <View>
      <Text>Add a New Recipe</Text>
      <TextInput placeholder="Recipe Title" />
      <TextInput placeholder="Ingredients" multiline />
      <Button title="Save Recipe" onPress={handleSaveRecipe} />
    </View>
  )
}

const handleSaveRecipe = () => {
}
