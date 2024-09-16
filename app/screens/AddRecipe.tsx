import { Button, TextField, Text, Screen } from "app/components"
import { colors, spacing, typography } from "app/theme"
import React, { useState } from "react"

import { TextStyle, View, ViewStyle } from "react-native"
import { DemoUseCase } from "./DemoShowroomScreen/DemoUseCase"
import { DemoDivider } from "./DemoShowroomScreen/DemoDivider"

// TODO implement
// TODO get text input component from template
export const AddRecipeScreen = () => {
  const [titleInput, setTitleInput] = useState("")
  const [summaryInput, setSummaryInput] = useState("")
  const [prepTimeInput, setPrepTimeInput] = useState("")
  const [cookTimeInput, setCookTimeInput] = useState("")
  const [servingsInput, setServingsInput] = useState("")
  return (
    <Screen
      preset="fixed"
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
          style={$saveButton}
          onPress={handleSaveRecipe}
        />
      </View>

      <DemoUseCase
        name=""
        description="Fill out the details for your new recipe."
      >
      <TextField
        value={titleInput}
        onChangeText={(value) => setTitleInput(value)}
        placeholderTx="recipeAddScreen.titlePlacehoder"
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={summaryInput}
        onChangeText={(value) => setSummaryInput(value)}
        placeholder="Summary (optional)"
        multiline
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={prepTimeInput}
        onChangeText={(value) => setPrepTimeInput(value)}
        placeholder="Prep time in minutes"
        inputMode="numeric"
        keyboardType="numeric"
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={cookTimeInput}
        onChangeText={(value) => setCookTimeInput(value)}
        placeholder="Cook time in minutes"
        inputMode="numeric"
        keyboardType="numeric"
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={servingsInput}
        onChangeText={(value) => setServingsInput(value)}
        placeholder="Servings"
        inputMode="numeric"
        keyboardType="numeric"
      />

    </DemoUseCase>
    </Screen>
  )
}

const handleSaveRecipe = () => {
}

const $screenContentContainer: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.md,
  marginTop: spacing.xl
}

const $titleContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: "center",
}

const $saveButton: ViewStyle = {
  minHeight: spacing.md,
}