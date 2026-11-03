import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { getSpeechRecognitionLocale } from "@/i18n/language"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Keyboard,
  type KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export interface RecipeAiEditDialogProps {
  visible: boolean
  isLoading: boolean
  errorMsg?: string
  onDismiss: () => void
  onApply: (prompt: string) => void
}

export function RecipeAiEditDialog({
  visible,
  isLoading,
  errorMsg,
  onDismiss,
  onApply,
}: RecipeAiEditDialogProps) {
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [prompt, setPrompt] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [speechError, setSpeechError] = useState("")

  const isRecordingRef = useRef(false)
  const isAbortingRef = useRef(false)
  const finalTranscriptRef = useRef("")
  const promptRef = useRef("")

  const updatePrompt = useCallback((value: string) => {
    promptRef.current = value
    setPrompt(value)
  }, [])

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0)
      return
    }

    const onFrame = (event: KeyboardEvent) => {
      const overlap =
        Platform.OS === "ios"
          ? windowHeight - event.endCoordinates.screenY
          : event.endCoordinates.height
      setKeyboardHeight(Math.max(0, overlap))
    }
    const showEvent = Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"
    const showSub = Keyboard.addListener(showEvent, onFrame)
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [visible, windowHeight])

  useEffect(() => {
    if (visible) {
      // Drop the recipe form keyboard before this sheet takes over, so both are not up at once.
      Keyboard.dismiss()
      return
    }

    Keyboard.dismiss()
    updatePrompt("")
    finalTranscriptRef.current = ""
    setSpeechError("")
    setIsRecording(false)
    isRecordingRef.current = false
    isAbortingRef.current = true
    ExpoSpeechRecognitionModule.abort()
  }, [visible, updatePrompt])

  useSpeechRecognitionEvent("result", (event) => {
    const segment = event.results[0]?.transcript ?? ""
    const combined = [finalTranscriptRef.current, segment].filter(Boolean).join(" ")
    if (event.isFinal) {
      finalTranscriptRef.current = combined
    }
    updatePrompt(combined)
  })

  useSpeechRecognitionEvent("end", () => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false
      setIsRecording(false)
    }
  })

  useSpeechRecognitionEvent("error", (event) => {
    if (isAbortingRef.current) {
      isAbortingRef.current = false
      return
    }
    setSpeechError(event.message ?? t("recipeAiEditDialog:unknownError"))
    isRecordingRef.current = false
    setIsRecording(false)
  })

  const handleStartListening = async () => {
    setSpeechError("")
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync()
    if (!granted) {
      setSpeechError(t("recipeAiEditDialog:microphonePermissionDenied"))
      return
    }

    isRecordingRef.current = true
    setIsRecording(true)
    finalTranscriptRef.current = promptRef.current.trim()
    ExpoSpeechRecognitionModule.start({
      lang: getSpeechRecognitionLocale(),
      interimResults: true,
      continuous: true,
    })
  }

  const handleStopListening = () => {
    isRecordingRef.current = false
    setIsRecording(false)
    ExpoSpeechRecognitionModule.stop()
  }

  const displayError = errorMsg || speechError
  const keyboardLift = keyboardHeight > 0 ? keyboardHeight : insets.bottom
  const maxDialogHeight = Math.max(220, windowHeight - keyboardLift - insets.top - theme.spacing.lg)

  const dismiss = () => {
    Keyboard.dismiss()
    onDismiss()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={themed($overlay)} onPress={dismiss}>
        <Pressable
          style={[
            themed($dialog),
            {
              marginBottom: keyboardLift + theme.spacing.md,
              maxHeight: maxDialogHeight,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets={false}
            bounces={false}
            contentContainerStyle={themed($dialogContent)}
            style={{ maxHeight: maxDialogHeight }}
          >
            <Text tx="recipeAiEditDialog:title" preset="subheading" style={themed($title)} />
            <Text tx="recipeAiEditDialog:subtitle" style={themed($subtitle)} />

            <TextField
              value={prompt}
              onChangeText={updatePrompt}
              multiline
              placeholderTx="recipeAiEditDialog:placeholder"
              style={themed($promptInput)}
              inputWrapperStyle={themed($promptInputWrapper)}
              editable={!isLoading}
            />

            <View style={themed($micRow)}>
              <TouchableOpacity
                onPress={isRecording ? handleStopListening : handleStartListening}
                disabled={isLoading}
                style={[themed($micButton), isRecording && themed($micButtonActive)]}
                accessibilityRole="button"
                accessibilityLabel={
                  isRecording
                    ? t("recipeAiEditDialog:stopListening")
                    : t("recipeAiEditDialog:startListening")
                }
              >
                <Text text="🎙" style={$micEmoji} />
              </TouchableOpacity>
              <Text
                text={
                  isRecording
                    ? t("recipeAiEditDialog:listening")
                    : t("recipeAiEditDialog:tapToSpeak")
                }
                style={themed($micHint)}
              />
            </View>

            {displayError ? <Text text={displayError} style={themed($errorText)} /> : null}

            <View style={themed($actions)}>
              <Button
                tx="recipeAiEditDialog:cancelButton"
                preset="default"
                style={themed($actionButton)}
                onPress={dismiss}
                disabled={isLoading}
              />
              <Button
                tx="recipeAiEditDialog:applyButton"
                preset="filled"
                style={themed($actionButton)}
                onPress={() => onApply(prompt.trim())}
                disabled={isLoading || !prompt.trim()}
              />
            </View>
          </ScrollView>

          {isLoading ? (
            <View style={themed($loadingOverlay)}>
              <ActivityIndicator size="large" color={theme.colors.tint} />
              <Text tx="recipeAiEditDialog:processing" style={themed($loadingText)} />
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

interface RecipeAiEditFabProps {
  onPress: () => void
  showLock: boolean
  disabled?: boolean
}

export function RecipeAiEditFab({ onPress, showLock, disabled }: RecipeAiEditFabProps) {
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={t("recipeAiEditDialog:fabAccessibilityLabel")}
      style={[
        themed($fab),
        { bottom: insets.bottom + theme.spacing.lg },
        disabled && themed($fabDisabled),
      ]}
    >
      <Image source={require("@/assets/icons/ai.png")} style={$fabIcon} />
      {showLock ? (
        <View style={themed($fabLockBadge)}>
          <Icon icon="lock" size={10} color={colors.palette.accent500} />
        </View>
      ) : null}
    </TouchableOpacity>
  )
}

const $overlay: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  justifyContent: "flex-end",
  paddingHorizontal: theme.spacing.md,
})

const $dialog: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  borderRadius: theme.spacing.md,
  maxHeight: "85%",
  overflow: "hidden",
})

const $dialogContent: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.lg,
  gap: theme.spacing.sm,
})

const $title: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  textAlign: "center",
  marginBottom: theme.spacing.xs,
})

const $promptInput: ThemedStyle<TextStyle> = () => ({
  minHeight: 120,
  textAlignVertical: "top",
})

const $promptInputWrapper: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
})

const $micRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
})

const $micButton: ThemedStyle<ViewStyle> = (theme) => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: theme.colors.backgroundDim,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: theme.colors.separator,
})

const $micButtonActive: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderColor: theme.colors.tint,
})

const $micEmoji: TextStyle = {
  fontSize: 22,
  lineHeight: 26,
  includeFontPadding: false,
}

const $micHint: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
  color: theme.colors.textDim,
})

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  textAlign: "center",
})

const $actions: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  gap: theme.spacing.sm,
  marginTop: theme.spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingOverlay: ThemedStyle<ViewStyle> = (theme) => ({
  ...({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle),
  backgroundColor: theme.colors.background,
  opacity: 0.92,
  borderRadius: theme.spacing.md,
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $fab: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  right: theme.spacing.lg,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: theme.colors.tint,
  alignItems: "center",
  justifyContent: "center",
  elevation: 6,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
})

const $fabIcon: ImageStyle = {
  width: 28,
  height: 28,
  tintColor: colors.palette.neutral100,
}

const $fabDisabled: ThemedStyle<ViewStyle> = () => ({
  opacity: 0.55,
})

const $fabLockBadge: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: -2,
  right: -2,
  backgroundColor: theme.colors.background,
  borderRadius: 10,
  width: 20,
  height: 20,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: colors.palette.accent400,
})
