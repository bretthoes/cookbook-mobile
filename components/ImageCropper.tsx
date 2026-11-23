import { Button } from "@/components/Button"
import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { imageCropRect, containScale, frameInsideImage } from "@/utils/imageCrop"
import { SaveFormat, manipulateAsync } from "expo-image-manipulator"
import { Image } from "expo-image"
import type { ImagePickerAsset } from "expo-image-picker"
import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, Modal, TextStyle, View, ViewStyle, StyleSheet } from "react-native"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const MAX_ZOOM = 4

export function ImageCropper({
  asset,
  aspect,
  onCancel,
  onConfirm,
}: {
  asset: ImagePickerAsset
  /** Width divided by height. Cookbook covers use 3/4. Recipe photos use 1. */
  aspect: number
  onCancel: () => void
  onConfirm: (asset: ImagePickerAsset) => void
}) {
  const { themed, theme } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [saving, setSaving] = useState(false)
  const [failed, setFailed] = useState(false)
  const [stage, setStage] = useState({ width: 0, height: 0 })
  const size = { width: asset.width, height: asset.height }

  const layout = useMemo(() => {
    if (stage.width <= 0 || stage.height <= 0 || size.width <= 0 || size.height <= 0) return null
    const areaWidth = Math.max(1, stage.width - spacing.lg * 2)
    const areaHeight = Math.max(1, stage.height - insets.top - spacing.md)
    const fit = containScale(size.width, size.height, areaWidth, areaHeight)
    const displayedWidth = size.width * fit
    const displayedHeight = size.height * fit
    const cropFrame = frameInsideImage(displayedWidth, displayedHeight, aspect)
    const imageLeft = (stage.width - displayedWidth) / 2
    const imageTop = insets.top + (areaHeight - displayedHeight) / 2
    return {
      fit,
      displayedWidth,
      displayedHeight,
      imageLeft,
      imageTop,
      frame: {
        x: imageLeft + (displayedWidth - cropFrame.width) / 2,
        y: imageTop + (displayedHeight - cropFrame.height) / 2,
        width: cropFrame.width,
        height: cropFrame.height,
      },
    }
  }, [aspect, insets.top, size.height, size.width, stage.height, stage.width])

  const zoom = useSharedValue(1)
  const savedZoom = useSharedValue(1)
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const savedX = useSharedValue(0)
  const savedY = useSharedValue(0)
  const fitScale = useSharedValue(layout?.fit ?? 1)
  const frameWidth = useSharedValue(layout?.frame.width ?? 0)
  const frameHeight = useSharedValue(layout?.frame.height ?? 0)
  const imageWidth = useSharedValue(size.width)
  const imageHeight = useSharedValue(size.height)
  fitScale.value = layout?.fit ?? 1
  frameWidth.value = layout?.frame.width ?? 0
  frameHeight.value = layout?.frame.height ?? 0

  const pinch = Gesture.Pinch()
    .onUpdate((event) => {
      const next = Math.min(MAX_ZOOM, Math.max(1, savedZoom.value * event.scale))
      zoom.value = next
      const limits = translationLimits(
        imageWidth.value * fitScale.value * next,
        imageHeight.value * fitScale.value * next,
        frameWidth.value,
        frameHeight.value,
      )
      translateX.value = clamp(translateX.value, -limits.x, limits.x)
      translateY.value = clamp(translateY.value, -limits.y, limits.y)
    })
    .onEnd(() => {
      savedZoom.value = zoom.value
      savedX.value = translateX.value
      savedY.value = translateY.value
    })

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      const limits = translationLimits(
        imageWidth.value * fitScale.value * zoom.value,
        imageHeight.value * fitScale.value * zoom.value,
        frameWidth.value,
        frameHeight.value,
      )
      translateX.value = clamp(savedX.value + event.translationX, -limits.x, limits.x)
      translateY.value = clamp(savedY.value + event.translationY, -limits.y, limits.y)
    })
    .onEnd(() => {
      savedX.value = translateX.value
      savedY.value = translateY.value
    })

  const gesture = Gesture.Simultaneous(pan, pinch)

  const imageFrame = {
    position: "absolute" as const,
    width: layout?.displayedWidth ?? 0,
    height: layout?.displayedHeight ?? 0,
    left: layout?.imageLeft ?? 0,
    top: layout?.imageTop ?? 0,
  }
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: zoom.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  const $themedFrame = useMemo(() => themed($frame), [themed])
  const $themedActions = useMemo(() => themed($actions), [themed])
  const $themedError = useMemo(() => themed($error), [themed])
  const $themedAction = useMemo(() => themed($action), [themed])

  const onUsePhoto = useCallback(async () => {
    if (saving || !layout || size.width <= 0 || size.height <= 0) return
    setSaving(true)
    setFailed(false)
    try {
      const crop = imageCropRect({
        imageWidth: size.width,
        imageHeight: size.height,
        frameWidth: layout.frame.width,
        frameHeight: layout.frame.height,
        scale: layout.fit * zoom.value,
        translateX: translateX.value,
        translateY: translateY.value,
      })
      const result = await manipulateAsync(asset.uri, [{ crop }], {
        compress: 0.8,
        format: SaveFormat.JPEG,
        base64: true,
      })
      onConfirm({
        uri: result.uri,
        width: result.width,
        height: result.height,
        base64: result.base64,
        mimeType: "image/jpeg",
        fileName: "image.jpg",
      })
    } catch {
      setFailed(true)
      setSaving(false)
    }
  }, [asset.uri, layout, onConfirm, saving, size.height, size.width, translateX, translateY, zoom])

  return (
    <Modal animationType="fade" presentationStyle="fullScreen" visible onRequestClose={onCancel}>
      <GestureHandlerRootView style={themed($root)}>
        <View
          style={themed($stage)}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout
            setStage((current) =>
              current.width === width && current.height === height ? current : { width, height },
            )
          }}
        >
          <GestureDetector gesture={gesture}>
            <View style={$gestureSurface}>
              <Animated.View pointerEvents="none" style={[imageFrame, imageStyle]}>
                <Image
                  source={{ uri: asset.uri }}
                  style={StyleSheet.absoluteFill}
                  contentFit="fill"
                />
              </Animated.View>
              {layout ? (
                <CropMask
                  hole={layout.frame}
                  stageWidth={stage.width}
                  stageHeight={stage.height}
                  color={theme.colors.palette.overlay50}
                />
              ) : null}
              {layout ? (
                <View
                  pointerEvents="none"
                  style={[
                    $themedFrame,
                    $frameBorder,
                    {
                      left: layout.frame.x,
                      top: layout.frame.y,
                      width: layout.frame.width,
                      height: layout.frame.height,
                    },
                  ]}
                />
              ) : null}
            </View>
          </GestureDetector>
        </View>
        {failed ? <Text tx="imageCropper:failed" style={$themedError} /> : null}
        <View style={[$themedActions, { paddingBottom: insets.bottom + spacing.md }]}>
          <Button
            tx="common:cancel"
            preset="default"
            onPress={onCancel}
            disabled={saving}
            style={$themedAction}
          />
          <Button
            tx="imageCropper:usePhoto"
            preset="filled"
            onPress={onUsePhoto}
            disabled={saving}
            style={$themedAction}
          />
          {saving ? <ActivityIndicator color={theme.colors.tint} /> : null}
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}

function translationLimits(
  displayedWidth: number,
  displayedHeight: number,
  frameWidth: number,
  frameHeight: number,
) {
  "worklet"
  return {
    x: Math.max(0, (displayedWidth - frameWidth) / 2),
    y: Math.max(0, (displayedHeight - frameHeight) / 2),
  }
}

function clamp(value: number, min: number, max: number) {
  "worklet"
  return Math.min(max, Math.max(min, value))
}

function CropMask({
  hole,
  stageWidth,
  stageHeight,
  color,
}: {
  hole: { x: number; y: number; width: number; height: number }
  stageWidth: number
  stageHeight: number
  color: string
}) {
  const right = Math.max(0, stageWidth - hole.x - hole.width)
  return (
    <View pointerEvents="none" style={$mask}>
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: hole.y,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: hole.y + hole.height,
          left: 0,
          right: 0,
          height: Math.max(0, stageHeight - hole.y - hole.height),
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: hole.y,
          left: 0,
          width: hole.x,
          height: hole.height,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          top: hole.y,
          right: 0,
          width: right,
          height: hole.height,
          backgroundColor: color,
        }}
      />
    </View>
  )
}

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $stage: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  overflow: "visible",
  backgroundColor: theme.colors.palette.neutral900,
})

const $gestureSurface: ViewStyle = {
  flex: 1,
  overflow: "visible",
}

const $mask: ViewStyle = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
}

const $frame: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.tint,
})

const $frameBorder: ViewStyle = {
  position: "absolute",
  borderWidth: 2,
}

const $actions: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: theme.spacing.sm,
  paddingHorizontal: theme.spacing.md,
  paddingTop: theme.spacing.md,
})

const $action: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $error: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.error,
  textAlign: "center",
  paddingHorizontal: theme.spacing.md,
})
