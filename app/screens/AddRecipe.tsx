import { Button, TextField, Text, Screen } from "app/components"
import { spacing } from "app/theme"
import React, { useState } from "react"
import { View, ViewStyle } from "react-native"
import { DemoUseCase } from "./DemoShowroomScreen/DemoUseCase"
import { DemoDivider } from "./DemoShowroomScreen/DemoDivider"

export const AddRecipeScreen = () => {
  const [titleInput, setTitleInput] = useState("")
  const [summaryInput, setSummaryInput] = useState("")
  const [prepTimeInput, setPrepTimeInput] = useState("")
  const [cookTimeInput, setCookTimeInput] = useState("")
  const [bakeTimeInput, setBakeTimeInput] = useState("")
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

      <DemoDivider size={spacing.xxl} line />

      <TextField
        value={prepTimeInput}
        onChangeText={(value) => setPrepTimeInput(value)}
        placeholder="Prep time in minutes (optional)"
        inputMode="numeric"
        keyboardType="numeric"
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={cookTimeInput}
        onChangeText={(value) => setCookTimeInput(value)}
        placeholder="Cook time in minutes (optional)"
        inputMode="numeric"
        keyboardType="numeric"
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={bakeTimeInput}
        onChangeText={(value) => setBakeTimeInput(value)}
        placeholder="Bake time in minutes (optional)"
        inputMode="numeric"
        keyboardType="numeric"
      />

      <DemoDivider size={spacing.lg} />

      <TextField
        value={servingsInput}
        onChangeText={(value) => setServingsInput(value)}
        placeholder="Servings (optional)"
        inputMode="numeric"
        keyboardType="numeric"
      />

      <DemoDivider size={spacing.xxl} line />

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