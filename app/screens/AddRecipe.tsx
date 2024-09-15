import { Icon, TextField } from "app/components"
import React, { useState } from "react"
import { View, Text, Button } from "react-native"

// TODO implement
// TODO get text input component from template
export const AddRecipeScreen = () => {
  const [titleInput, setTitleInput] = useState("")
  const [input, setInput] = useState("")
  return (
    <View>
      <Text>Add a New Recipe</Text>
      <TextField 
        value={titleInput}
        onChangeText={(value) => setTitleInput(value)}
        status="error"
        labelTx="recipeAddScreen.titleLabel"
        labelTxOptions={{ title: "Chicken Casserole" }}
        LabelTextProps={{ style: { color: "#FFFFFF" } }}
        placeholderTx="recipeAddScreen.titlePlacehoder"
        placeholderTxOptions={{ title: "Chicken Casserole" }}
        helper="Enter your name"
        helperTx="recipeAddScreen.titleHelper"
        helperTxOptions={{ title: "Chicken Casserole" }}
        HelperTextProps={{ style: { color: "#FFFFFF" } }}
        style={{ backgroundColor: "#BFBFBF" }}
        containerStyle={{ backgroundColor: "#BFBFBF" }}
        inputWrapperStyle={{ backgroundColor: "#BFBFBF" }}
        RightAccessory={() => <Icon icon="check" />}
        LeftAccessory={() => <Icon icon="bell" />}
        />
        <TextField 
        value={input}
        onChangeText={(value) => setInput(value)}
        status="error"
        labelTx="recipeAddScreen.titleLabel"
        labelTxOptions={{ title: "Chicken Casserole" }}
        LabelTextProps={{ style: { color: "#FFFFFF" } }}
        placeholderTx="recipeAddScreen.titlePlacehoder"
        placeholderTxOptions={{ title: "Chicken Casserole" }}
        helper="Enter your name"
        helperTx="recipeAddScreen.titleHelper"
        helperTxOptions={{ title: "Chicken Casserole" }}
        HelperTextProps={{ style: { color: "#FFFFFF" } }}
        style={{ backgroundColor: "#BFBFBF" }}
        containerStyle={{ backgroundColor: "#BFBFBF" }}
        inputWrapperStyle={{ backgroundColor: "#BFBFBF" }}
        RightAccessory={() => <Icon icon="check" />}
        LeftAccessory={() => <Icon icon="bell" />}
        multiline
        />
      <Button title="Save Recipe" onPress={handleSaveRecipe} />
    </View>
  )
}

const handleSaveRecipe = () => {
}
