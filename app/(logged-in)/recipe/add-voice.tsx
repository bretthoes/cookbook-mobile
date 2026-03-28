import { Button } from "@/components/Button"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useStores } from "@/models/helpers/useStores"
import { api } from "@/services/api"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ScrollView, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"

type Phase = "idle" | "recording" | "processing"

export default observer(function AddRecipeVoiceScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const { recipeStore } = useStores()
  const { setRecipeToAdd } = recipeStore

  const [phase, setPhase] = useState<Phase>("idle")
  const [displayTranscript, setDisplayTranscript] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Refs hold latest values so event callbacks aren't stale
  const phaseRef = useRef<Phase>("idle")
  const transcriptRef = useRef("")
  const finalTranscriptRef = useRef("")
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const MAX_RECORDING_MS = 5 * 60 * 1000

  const updatePhase = useCallback((p: Phase) => {
    phaseRef.current = p
    setPhase(p)
  }, [])

  // Pulsing animation while recording
  const pulseScale = useSharedValue(1)
  const pulseOpacity = useSharedValue(1)

  useEffect(() => {
    if (phase === "recording") {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.25, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
      )
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0.5, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
      )
    } else {
      pulseScale.value = withTiming(1)
      pulseOpacity.value = withTiming(1)
    }
  }, [phase, pulseOpacity, pulseScale])

  const $animatedRing = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }))

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddVoiceScreen:title",
    onLeftPress: () => {
      if (maxDurationTimerRef.current) {
        clearTimeout(maxDurationTimerRef.current)
        maxDurationTimerRef.current = null
      }
      ExpoSpeechRecognitionModule.abort()
      router.back()
    },
  })

  const processTranscript = useCallback(async () => {
    const text = transcriptRef.current.trim()
    if (!text) {
      setErrorMsg(t("recipeAddVoiceScreen:noTranscript"))
      updatePhase("idle")
      return
    }

    updatePhase("processing")
    const result = await api.extractRecipeFromVoice(text)

    if (result.kind === "ok") {
      recipeStore.incrementImportCount()
      setRecipeToAdd(result.recipe)
      router.replace("/(logged-in)/recipe/add")
    } else if (result.kind === "rate-limited") {
      setErrorMsg(t("recipeAddVoiceScreen:rateLimited"))
      updatePhase("idle")
    } else {
      setErrorMsg(t("recipeAddVoiceScreen:parseFailed"))
      updatePhase("idle")
    }
  }, [t, recipeStore, updatePhase, setRecipeToAdd])

  useSpeechRecognitionEvent("result", (event) => {
    const segment = event.results[0]?.transcript ?? ""
    const combined = [finalTranscriptRef.current, segment].filter(Boolean).join(" ")
    if (event.isFinal) {
      finalTranscriptRef.current = combined
    }
    transcriptRef.current = combined
    setDisplayTranscript(combined)
  })

  useSpeechRecognitionEvent("end", () => {
    if (phaseRef.current === "recording") {
      processTranscript()
    }
  })

  useSpeechRecognitionEvent("error", (event) => {
    setErrorMsg(event.message ?? t("recipeAddVoiceScreen:unknownError"))
    updatePhase("idle")
  })

  const handleStart = async () => {
    setErrorMsg("")
    setDisplayTranscript("")
    transcriptRef.current = ""
    finalTranscriptRef.current = ""

    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    if (!granted) {
      setErrorMsg(t("recipeAddVoiceScreen:microphonePermissionDenied"))
      return
    }

    updatePhase("recording")
    ExpoSpeechRecognitionModule.start({ lang: "en-US", interimResults: true, continuous: true })

    maxDurationTimerRef.current = setTimeout(() => {
      if (phaseRef.current === "recording") {
        ExpoSpeechRecognitionModule.stop()
      }
    }, MAX_RECORDING_MS)
  }

  const handleStop = () => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current)
      maxDurationTimerRef.current = null
    }
    ExpoSpeechRecognitionModule.stop()
    // "end" event fires and triggers processTranscript
  }

  const handleCancel = () => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current)
      maxDurationTimerRef.current = null
    }
    ExpoSpeechRecognitionModule.abort()
    transcriptRef.current = ""
    finalTranscriptRef.current = ""
    setDisplayTranscript("")
    setErrorMsg("")
    updatePhase("idle")
  }

  if (phase === "processing") {
    return (
      <LoadingScreen text={t("recipeAddVoiceScreen:processing")} estimatedDurationMs={10_000} />
    )
  }

  const isRecording = phase === "recording"

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={themed($container)}>
      <View style={themed($micSection)}>
        <TouchableOpacity
          onPress={isRecording ? handleStop : handleStart}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            isRecording
              ? t("recipeAddVoiceScreen:stopButton")
              : t("recipeAddVoiceScreen:startButton")
          }
        >
          <Animated.View style={[$ring, themed($ringThemed), $animatedRing]}>
            <View style={[themed($micCircle), isRecording && themed($micCircleActive)]}>
              <Text text="🎙" style={$micEmoji} />
            </View>
          </Animated.View>
        </TouchableOpacity>

        <Text
          text={
            isRecording ? t("recipeAddVoiceScreen:listening") : t("recipeAddVoiceScreen:tapToStart")
          }
          style={themed($statusText)}
          preset={isRecording ? "bold" : "default"}
        />
      </View>

      {displayTranscript ? (
        <View style={themed($transcriptContainer)}>
          <Text
            tx="recipeAddVoiceScreen:transcriptLabel"
            preset="formLabel"
            style={themed($transcriptLabel)}
          />
          <ScrollView style={$transcriptScroll} nestedScrollEnabled>
            <Text text={displayTranscript} style={themed($transcriptText)} />
          </ScrollView>
        </View>
      ) : null}

      {errorMsg ? <Text text={errorMsg} style={themed($errorText)} /> : null}

      {isRecording && (
        <>
          <Button
            tx="recipeAddVoiceScreen:stopButton"
            preset="filled"
            style={themed($actionButton)}
            onPress={handleStop}
          />
          <Button
            tx="recipeAddVoiceScreen:cancelButton"
            preset="default"
            style={themed($actionButton)}
            onPress={handleCancel}
          />
        </>
      )}

      {!isRecording && (
        <Button
          tx="recipeAddVoiceScreen:startButton"
          preset="reversed"
          style={themed($actionButton)}
          onPress={handleStart}
        />
      )}
    </Screen>
  )
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flexGrow: 1,
  paddingHorizontal: theme.spacing.lg,
  paddingBottom: theme.spacing.xl,
  gap: theme.spacing.lg,
})

const $micSection: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  paddingTop: theme.spacing.xl,
  gap: theme.spacing.md,
})

const $ring: ViewStyle = {
  width: 140,
  height: 140,
  borderRadius: 70,
  alignItems: "center",
  justifyContent: "center",
}

const $ringThemed: ThemedStyle<ViewStyle> = (theme) => ({
  borderWidth: 2,
  borderColor: theme.colors.tint,
})

const $micCircle: ThemedStyle<ViewStyle> = (theme) => ({
  width: 112,
  height: 112,
  borderRadius: 56,
  backgroundColor: theme.colors.backgroundDim,
  alignItems: "center",
  justifyContent: "center",
})

const $micCircleActive: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
})

const $micEmoji: TextStyle = {
  fontSize: 48,
  lineHeight: 56,
  includeFontPadding: false,
}

const $statusText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  textAlign: "center",
})

const $transcriptContainer: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.sm,
  padding: theme.spacing.md,
  maxHeight: 180,
})

const $transcriptLabel: ThemedStyle<TextStyle> = (theme) => ({
  marginBottom: theme.spacing.xs,
  color: theme.colors.textDim,
})

const $transcriptScroll: ViewStyle = {
  flexGrow: 0,
}

const $transcriptText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  lineHeight: 22,
})

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  textAlign: "center",
})

const $actionButton: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.sm,
})
