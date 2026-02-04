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
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Image, ImageStyle, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

const loadingImage = require("../../../assets/images/loading.png")

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

  // Animation for the loading text
  const translateY = useSharedValue(0)

  const animatedTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  useEffect(() => {
    if (isLoading) {
      // Bouncing animation for the text
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 400 }),
          withTiming(0, { duration: 400 }),
        ),
        -1, // infinite
        false,
      )
    } else {
      translateY.value = 0
    }
  }, [isLoading, translateY])

  const getValidationError = useCallback((urlToValidate: string) => {
    if (urlToValidate.length === 0) return "can't be blank"
    if (!isValidUrl(urlToValidate)) return "must be a valid URL"
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
      setResult("Failed to add recipe, please try again.")
    }
    setIsSubmitted(false)
  }

  const $loadingContainer: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }

  const $loadingImage: ImageStyle = {
    width: 250,
    height: 250,
    marginBottom: spacing.lg,
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

  if (isLoading) {
    return (
      <Screen style={$root} preset="fixed" contentContainerStyle={$loadingContainer}>
        <Image source={loadingImage} style={$loadingImage} resizeMode="contain" />
        <Animated.View style={animatedTextStyle}>
          <Text preset="subheading" text="Almost done..." />
        </Animated.View>
      </Screen>
    )
  }

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
