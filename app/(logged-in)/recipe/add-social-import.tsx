import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { translate, TxKeyPath } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
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

const PLATFORM_TITLES: Record<Platform, TxKeyPath> = {
  tiktok: "recipeAddSocialImportScreen:titleTiktok",
  instagram: "recipeAddSocialImportScreen:titleInstagram",
  pinterest: "recipeAddSocialImportScreen:titlePinterest",
}

const PLATFORM_SUBTITLES: Record<Platform, TxKeyPath> = {
  tiktok: "recipeAddSocialImportScreen:subtitleTiktok",
  instagram: "recipeAddSocialImportScreen:subtitleInstagram",
  pinterest: "recipeAddSocialImportScreen:subtitlePinterest",
}

const PLATFORM_PLACEHOLDERS: Record<Platform, TxKeyPath> = {
  tiktok: "recipeAddSocialImportScreen:urlPlaceholderTiktok",
  instagram: "recipeAddSocialImportScreen:urlPlaceholderInstagram",
  pinterest: "recipeAddSocialImportScreen:urlPlaceholderPinterest",
}

export default observer(function AddSocialImportScreen() {
  const { platform: rawPlatform } = useLocalSearchParams<{ platform: string }>()
  const platform = (rawPlatform ?? "tiktok") as Platform
  const { t } = useTranslation()

  const { recipeStore } = useStores()
  const { isInFlight, run } = useInFlightAction()

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

  const handleNext = useCallback(() => {
    run(async () => {
      setIsSubmitted(true)
      const error = getValidationError(url)
      if (error) return

      setIsLoading(true)
      const importResult = await recipeStore.importFromSocialUrl(url)
      setIsLoading(false)

      if (importResult.ok) {
        router.replace("/(logged-in)/recipe/add")
      } else if (importResult.kind === "rate-limited") {
        setResult(t("recipeAddSocialImportScreen:rateLimited"))
      } else {
        setResult(t("recipeAddSocialImportScreen:extractFailed"))
      }
      setIsSubmitted(false)
    })
  }, [url, getValidationError, recipeStore, run, t])

  useHeader(
    {
      titleTx: PLATFORM_TITLES[platform],
      onLeftPress: () => router.back(),
      leftIcon: "back",
      onRightPress: isInFlight ? undefined : handleNext,
      rightTx: "recipeAddSocialImportScreen:import",
    },
    [handleNext, isInFlight, platform],
  )

  if (isLoading) {
    return <LoadingScreen estimatedDurationMs={25_000} />
  }

  return (
    <Screen style={$root} preset="scroll">
      <Text tx={PLATFORM_SUBTITLES[platform]} style={{ paddingHorizontal: spacing.md }} />
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
          labelTx="recipeAddSocialImportScreen:urlLabel"
          placeholderTx={PLATFORM_PLACEHOLDERS[platform]}
          helper={validationError}
          status={validationError ? "error" : undefined}
        />
        {result ? <Text text={result} preset="formHelper" /> : null}
      </FormCard>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
