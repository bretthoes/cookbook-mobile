import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { api } from "@/services/api"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ViewStyle } from "react-native"

const isValidUrl = (input: string) => {
  const regex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i
  return regex.test(input)
}

const MINIMUM_LOADING_TIME_MS = 1500

export default observer(function RecipeUrlScreen() {
  const {
    recipeStore: { setRecipeToAdd },
  } = useStores()

  const [url, setUrl] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")

  const getValidationError = useCallback((urlToValidate: string) => {
    if (urlToValidate.length === 0) return translate("recipeSelectUrlScreen:validation.cantBeBlank")
    if (!isValidUrl(urlToValidate))
      return translate("recipeSelectUrlScreen:validation.mustBeValidUrl")
    return ""
  }, [])

  const validationError = useMemo(
    () => (isSubmitted ? getValidationError(url) : ""),
    [isSubmitted, url, getValidationError],
  )

  useEffect(() => {
    setUrl("")
    setIsSubmitted(false)
  }, [])

  const handleNext = async () => {
    setIsSubmitted(true)
    const error = getValidationError(url)
    if (error) return

    setIsLoading(true)
    const startTime = Date.now()

    const uploadResponse = await api.extractRecipeFromUrl(url)

    // Ensure minimum loading time of 1.5 seconds
    const elapsed = Date.now() - startTime
    if (elapsed < MINIMUM_LOADING_TIME_MS) {
      await new Promise((resolve) => setTimeout(resolve, MINIMUM_LOADING_TIME_MS - elapsed))
    }

    setIsLoading(false)

    if (uploadResponse.kind === "ok") {
      setRecipeToAdd(uploadResponse.recipe)
      router.replace("../recipe/add")
    } else {
      setResult(translate("recipeSelectUrlScreen:extractFailed"))
    }
    setIsSubmitted(false)
  }

  useHeader(
    {
      titleTx: "recipeSelectUrlScreen:title",
      onLeftPress: () => router.back(),
      leftIcon: "back",
      onRightPress: handleNext,
      rightTx: "recipeSelectUrlScreen:next",
    },
    [url],
  )

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text tx="recipeSelectUrlScreen:subtitle" style={{ paddingHorizontal: spacing.md }} />
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
          labelTx="recipeSelectUrlScreen:urlLabel"
          placeholderTx="recipeSelectUrlScreen:urlPlaceholder"
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
