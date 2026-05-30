import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import { useImportRecipeFromUrlMutation } from "@/hooks/queries/useRecipesQuery"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { translate } from "@/i18n"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { ViewStyle } from "react-native"

const isValidUrl = (input: string) => {
  const regex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i
  return regex.test(input)
}

export default function RecipeUrlScreen() {
  const importFromUrl = useImportRecipeFromUrlMutation()
  const { isInFlight, run } = useInFlightAction()

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

  const handleNext = useCallback(() => {
    run(async () => {
      setIsSubmitted(true)
      const error = getValidationError(url)
      if (error) return

      setIsLoading(true)
      const importResult = await importFromUrl.mutateAsync(url)
      setIsLoading(false)

      if (importResult.ok) {
        router.replace("/(logged-in)/recipe/add")
      } else {
        setResult(translate("recipeSelectUrlScreen:extractFailed"))
      }
      setIsSubmitted(false)
    })
  }, [url, getValidationError, importFromUrl, run])

  useHeader(
    {
      titleTx: "recipeSelectUrlScreen:title",
      onLeftPress: () => router.back(),
      leftIcon: "back",
      onRightPress: isInFlight ? undefined : handleNext,
      rightTx: "recipeSelectUrlScreen:next",
    },
    [handleNext, isInFlight],
  )

  if (isLoading) {
    return <LoadingScreen estimatedDurationMs={8_000} />
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text tx="recipeSelectUrlScreen:subtitle" style={{ paddingHorizontal: spacing.md }} />
      <FormCard>
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
      </FormCard>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}
