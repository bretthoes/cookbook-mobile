import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Button, Screen, Text, TextField } from "src/components"
import { spacing } from "src/theme"
import { useStores } from "src/models/helpers/useStores"
import { api } from "src/services/api"
import { router } from "expo-router"


export default observer(function RecipeUrlScreen() {
  const { 
      recipeStore: { setRecipeToAdd },
    } = useStores()

  const [url, setUrl] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)


  useEffect(() => {
    setResult("")
    setValidationError(null)
  }, [])

  const isValidUrl = (input: string) => {
    const regex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i
    return regex.test(input)
  }

  async function send() {
    setIsSubmitted(true)
    setValidationError(null)

    if (!url || !isValidUrl(url)) {
      setValidationError("Please enter a valid URL.")
      setIsSubmitted(false)
      return
    }

    const uploadResponse = await api.extractRecipeFromUrl(url)

    if (uploadResponse.kind === "ok") {
      setRecipeToAdd(uploadResponse.recipe)
      router.replace("/(app)/recipe/add")
    } else {
      setResult("Failed to add recipe, please try again.")
    }

    setIsSubmitted(false)
  }

  return (
    <Screen style={$root} preset="auto" safeAreaEdges={["top"]}>
      <TextField
        value={url}
        onChangeText={setUrl}
        containerStyle={$textField}
        autoCapitalize="none"
        autoComplete="url"
        autoCorrect={false}
        keyboardType="url"
        label="Paste a valid URL below:"
        placeholder="Your favorite recipe URL"
        helper={validationError || result}
        status={validationError || result ? "error" : undefined}
      />
      <Text text={`${result}`} preset="formHelper" />
      <Button
        text="Send"
        style={$tapButton}
        preset="reversed"
        onPress={send}
        disabled={isSubmitted}
      />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  paddingHorizontal: spacing.sm,
  paddingTop: spacing.lg,
}

const $textField: ViewStyle = {
  marginBottom: spacing.lg,
}

const $tapButton: ViewStyle = {
  marginTop: spacing.xs,
}
