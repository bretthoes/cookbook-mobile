import { FormCard } from "@/components/FormCard"
import { LoadingScreen } from "@/components/LoadingScreen"
import { SupportedRecipeSites } from "@/components/Recipe/SupportedRecipeSites"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import {
  useImportRecipeFromSocialUrlMutation,
  useImportRecipeFromUrlMutation,
} from "@/hooks/queries/useRecipesQuery"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { translate } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import {
  recipeUrlIsLongFormYouTube,
  recipeUrlUsesVideoExtraction,
} from "@/utils/recipeImportUrl"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

const WEBSITE_LOADING_MS = 20_000
const VIDEO_LOADING_MS = 50_000

const isValidUrl = (input: string) => {
  const regex = /^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/i
  return regex.test(input)
}

export default function RecipeUrlScreen() {
  const { themed } = useAppTheme()
  const importFromUrl = useImportRecipeFromUrlMutation()
  const importFromSocial = useImportRecipeFromSocialUrlMutation()
  const { isInFlight, run } = useInFlightAction()

  const [url, setUrl] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingDurationMs, setLoadingDurationMs] = useState(WEBSITE_LOADING_MS)
  const [result, setResult] = useState("")

  const getValidationError = useCallback((urlToValidate: string) => {
    if (urlToValidate.length === 0) return translate("recipeSelectUrlScreen:validation.cantBeBlank")
    if (!isValidUrl(urlToValidate))
      return translate("recipeSelectUrlScreen:validation.mustBeValidUrl")
    if (recipeUrlIsLongFormYouTube(urlToValidate))
      return translate("recipeLinkImport:youtubeShortsOnly")
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

      const usesVideo = recipeUrlUsesVideoExtraction(url)
      setLoadingDurationMs(usesVideo ? VIDEO_LOADING_MS : WEBSITE_LOADING_MS)
      setIsLoading(true)
      const importResult = usesVideo
        ? await importFromSocial.mutateAsync(url)
        : await importFromUrl.mutateAsync(url)
      setIsLoading(false)

      if (importResult.ok) {
        router.replace("/(logged-in)/recipe/add")
      } else if (importResult.kind === "rate-limited") {
        setResult(translate("recipeSelectUrlScreen:rateLimited"))
      } else {
        setResult(translate("recipeSelectUrlScreen:extractFailed"))
      }
      setIsSubmitted(false)
    })
  }, [url, getValidationError, importFromSocial, importFromUrl, run])

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
    return <LoadingScreen estimatedDurationMs={loadingDurationMs} />
  }

  return (
    <Screen style={$root} preset="scroll">
      <View style={themed($intro)}>
        <Text tx="recipeLinkImport:summary" style={themed($summary)} />
        <SupportedRecipeSites />
      </View>
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
        {result ? <Text text={result} preset="formHelper" /> : null}
      </FormCard>
    </Screen>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $intro: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
  paddingTop: theme.spacing.sm,
  gap: theme.spacing.md,
})

const $summary: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.text,
})
