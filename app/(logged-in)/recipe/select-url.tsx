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
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
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

  // Animation for the typing dots
  const dot1Y = useSharedValue(0)
  const dot2Y = useSharedValue(0)
  const dot3Y = useSharedValue(0)

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }))

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }))

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }))

  useEffect(() => {
    if (isLoading) {
      const bounce = withRepeat(
        withSequence(
          withTiming(-6, { duration: 200 }),
          withTiming(0, { duration: 200 }),
        ),
        -1,
        false,
      )
      // Stagger each dot's animation
      dot1Y.value = bounce
      dot2Y.value = withDelay(150, bounce)
      dot3Y.value = withDelay(300, bounce)
    } else {
      dot1Y.value = 0
      dot2Y.value = 0
      dot3Y.value = 0
    }
  }, [isLoading, dot1Y, dot2Y, dot3Y])

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

  const $loadingTextRow: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
  }

  const $dot: TextStyle = {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 2,
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
        <View style={$loadingTextRow}>
          <Text preset="subheading" text="Almost done" />
          <Animated.Text style={[dot1Style, $dot]}>.</Animated.Text>
          <Animated.Text style={[dot2Style, $dot]}>.</Animated.Text>
          <Animated.Text style={[dot3Style, $dot]}>.</Animated.Text>
        </View>
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
