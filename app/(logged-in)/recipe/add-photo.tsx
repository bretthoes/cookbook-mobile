import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { LoadingScreen } from "@/components/LoadingScreen"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useImportRecipeFromImageMutation } from "@/hooks/queries/useRecipesQuery"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { useActionSheet } from "@/hooks/useActionSheet"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Image, TextStyle, View, ViewStyle, type ImageStyle } from "react-native"

type Phase = "idle" | "processing" | "error"

export default function AddRecipePhotoScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const importFromImage = useImportRecipeFromImageMutation()
  const { showActionSheetWithOptions } = useActionSheet()

  const [phase, setPhase] = useState<Phase>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [previewUri, setPreviewUri] = useState<string | null>(null)
  const hasAutoLaunchedPicker = useRef(false)

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddPhotoScreen:title",
    onLeftPress: () => {
      if (phase === "processing") return
      router.back()
    },
  })

  const processPickedAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      setPreviewUri(asset.uri)
      setErrorMsg("")
      setPhase("processing")

      const importResult = await importFromImage.mutateAsync(asset)

      if (importResult.ok) {
        router.replace("/(logged-in)/recipe/add")
        return
      }

      if (importResult.kind === "rate-limited") {
        setErrorMsg(t("recipeAddPhotoScreen:rateLimited"))
      } else {
        setErrorMsg(t("recipeAddPhotoScreen:parseFailed"))
      }
      setPhase("error")
    },
    [importFromImage, t],
  )

  const launchPicker = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      setErrorMsg(t("recipeAddPhotoScreen:cameraRollPermissionDenied"))
      setPhase("error")
      return
    }

    const options = [
      t("recipeAddPhotoScreen:takePhoto"),
      t("recipeAddPhotoScreen:selectFromRoll"),
      t("common:cancel"),
    ]
    const cancelButtonIndex = options.length - 1

    showActionSheetWithOptions({ options, cancelButtonIndex }, async (buttonIndex) => {
      if (buttonIndex === 0) {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
        if (!cameraPermission.granted) {
          setErrorMsg(t("recipeAddPhotoScreen:cameraPermissionDenied"))
          setPhase("error")
          return
        }

        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          mediaTypes: ["images"],
        })
        if (!result.canceled && result.assets?.length) {
          await processPickedAsset(result.assets[0])
        }
      } else if (buttonIndex === 1) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: false,
          allowsEditing: true,
        })
        if (!result.canceled && result.assets?.length) {
          await processPickedAsset(result.assets[0])
        }
      }
    })
  }, [processPickedAsset, showActionSheetWithOptions, t])

  useEffect(() => {
    if (hasAutoLaunchedPicker.current) return
    hasAutoLaunchedPicker.current = true
    void launchPicker()
  }, [launchPicker])

  const handleTryAgain = useCallback(() => {
    setErrorMsg("")
    setPreviewUri(null)
    setPhase("idle")
    void launchPicker()
  }, [launchPicker])

  if (phase === "processing") {
    return (
      <LoadingScreen
        text={t("recipeAddPhotoScreen:processing")}
        estimatedDurationMs={15_000}
      />
    )
  }

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={themed($container)}>
      <View style={themed($heroSection)}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={themed($previewImage)} resizeMode="cover" />
        ) : (
          <View style={themed($iconCircle)}>
            <Icon icon="camera" size={48} color={colors.tint} />
          </View>
        )}

        <Text
          tx={phase === "error" ? "recipeAddPhotoScreen:errorTitle" : "recipeAddPhotoScreen:subtitle"}
          style={themed($subtitle)}
        />
      </View>

      {errorMsg ? <Text text={errorMsg} style={themed($errorText)} /> : null}

      <Button
        tx="recipeAddPhotoScreen:choosePhoto"
        preset="filled"
        style={themed($actionButton)}
        onPress={handleTryAgain}
      />
    </Screen>
  )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flexGrow: 1,
  paddingHorizontal: theme.spacing.lg,
  paddingBottom: theme.spacing.xl,
  gap: theme.spacing.lg,
})

const $heroSection: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  paddingTop: theme.spacing.xl,
  gap: theme.spacing.md,
})

const $iconCircle: ThemedStyle<ViewStyle> = (theme) => ({
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: theme.colors.backgroundDim,
  alignItems: "center",
  justifyContent: "center",
})

const $previewImage: ThemedStyle<ImageStyle> = (theme) => ({
  width: 180,
  height: 180,
  borderRadius: theme.spacing.md,
})

const $subtitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  textAlign: "center",
})

const $errorText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  textAlign: "center",
})

const $actionButton: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.sm,
})
