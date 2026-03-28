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
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ViewStyle } from "react-native"

type Platform = "tiktok" | "instagram" | "pinterest"

const isValidUrl = (input: string) => {
  const regex = /^(https?):\/\/[^\s$.?#].[^\s]*$/i
  return regex.test(input)
}

const PLATFORM_TITLES: Record<Platform, string> = {
  tiktok: "recipeAddSocialImportScreen:titleTiktok",
  instagram: "recipeAddSocialImportScreen:titleInstagram",
  pinterest: "recipeAddSocialImportScreen:titlePinterest",
}

const PLATFORM_SUBTITLES: Record<Platform, string> = {
  tiktok: "recipeAddSocialImportScreen:subtitleTiktok",
  instagram: "recipeAddSocialImportScreen:subtitleInstagram",
  pinterest: "recipeAddSocialImportScreen:subtitlePinterest",
}

const PLATFORM_PLACEHOLDERS: Record<Platform, string> = {
  tiktok: "recipeAddSocialImportScreen:urlPlaceholderTiktok",
  instagram: "recipeAddSocialImportScreen:urlPlaceholderInstagram",
  pinterest: "recipeAddSocialImportScreen:urlPlaceholderPinterest",
}

const MINIMUM_LOADING_TIME_MS = 1500

export default observer(function AddSocialImportScreen() {
  const { platform: rawPlatform } = useLocalSearchParams<{ platform: string }>()
  const platform = (rawPlatform ?? "tiktok") as Platform
  const { t } = useTranslation()

  const {
    recipeStore: { setRecipeToAdd },
  } = useStores()

  const [url, setUrl] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState("")

  const getValidationError = useCallback((urlToValidate: string) => {
    if (urlToValidate.length === 0)
      return translate("recipeAddSocialImportScreen:validation.cantBeBlank")
    if (!isValidUrl(urlToValidate))
      return translate("recipeAddSocialImportScreen:validation.mustBeValidUrl")
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

    const response = await api.extractRecipeFromSocialUrl(url)

    const elapsed = Date.now() - startTime
    if (elapsed < MINIMUM_LOADING_TIME_MS) {
      await new Promise((resolve) => setTimeout(resolve, MINIMUM_LOADING_TIME_MS - elapsed))
    }

    setIsLoading(false)

    if (response.kind === "ok") {
      setRecipeToAdd(response.recipe)
      router.replace("../recipe/add")
    } else if (response.kind === "rate-limited") {
      setResult(t("recipeAddSocialImportScreen:rateLimited"))
    } else {
      setResult(t("recipeAddSocialImportScreen:extractFailed"))
    }
    setIsSubmitted(false)
  }

  useHeader(
    {
      titleTx: PLATFORM_TITLES[platform] as never,
      onLeftPress: () => router.back(),
      leftIcon: "back",
      onRightPress: handleNext,
      rightTx: "recipeAddSocialImportScreen:import",
    },
    [url],
  )

  if (isLoading) {
    return <LoadingScreen estimatedDurationMs={25_000} />
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text tx={PLATFORM_SUBTITLES[platform] as never} style={{ paddingHorizontal: spacing.md }} />
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
          labelTx="recipeAddSocialImportScreen:urlLabel"
          placeholderTx={PLATFORM_PLACEHOLDERS[platform] as never}
          helper={validationError}
          status={validationError ? "error" : undefined}
        />
        {result ? <Text text={result} preset="formHelper" /> : null}
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
