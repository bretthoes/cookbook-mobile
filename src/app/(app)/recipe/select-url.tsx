import React, { useEffect, useMemo, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { Screen, Text, TextField, UseCase } from "src/components"
import { spacing } from "src/theme"
import { useStores } from "src/models/helpers/useStores"
import { api } from "src/services/api"
import { router } from "expo-router"
import { useHeader } from "src/utils/useHeader"

export default observer(function RecipeUrlScreen() {
  const {
    recipeStore: { setRecipeToAdd },
  } = useStores()

  const [url, setUrl] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState("")

  const getValidationError = (url: string) => {
    if (url.length === 0) return "can't be blank"
    if (!isValidUrl(url)) return "must be a valid URL"
    return ""
  }

  const isValidUrl = (input: string) => {
    const regex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i
    return regex.test(input)
  }

  const validationError = useMemo(
    () => (isSubmitted ? getValidationError(url) : ""),
    [isSubmitted, url],
  )

  useEffect(() => {
    setUrl("")
    setIsSubmitted(false)
  }, [])

  const handleNext = async () => {
    setIsSubmitted(true)
    const error = getValidationError(url)
    if (error) return

    const uploadResponse = await api.extractRecipeFromUrl(url)
    if (uploadResponse.kind === "ok") {
      setRecipeToAdd(uploadResponse.recipe)
      router.replace("/(app)/recipe/add")
    } else {
      setResult("Failed to add recipe, please try again.")
    }
    setIsSubmitted(false)
  }

  useHeader(
    {
      title: "Add Recipe",
      onLeftPress: () => router.back(),
      leftIcon: "back",
      onRightPress: handleNext,
      rightText: "Next",
    },
    [url],
  )

  return (
    <Screen style={$root} preset="scroll">
      <Text
        text="Enter a valid link and we'll extract the recipe for you."
        style={{ paddingHorizontal: spacing.md }}
      />
      <UseCase>
        <TextField
          value={url}
          onChangeText={(text) => {
            const cleanText = text.replace(/\s/g, "")
            setUrl(cleanText)
          }}
          autoCapitalize="none"
          autoComplete="url"
          autoCorrect={false}
          keyboardType="url"
          label="URL:"
          placeholder="www.example.com/recipe"
          helper={validationError}
          status={validationError ? "error" : undefined}
        />
        <Text text={`${result}`} preset="formHelper" />
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
