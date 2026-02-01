import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { useStores } from "@/models/helpers/useStores"
import { api } from "@/services/api"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useState } from "react"
import { ViewStyle } from "react-native"

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
      router.replace("../recipe/add")
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
