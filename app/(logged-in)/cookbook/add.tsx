import { GettingStartedGuide } from "@/components/cookbooks/GettingStartedGuide"
import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { ImageCropper } from "@/components/ImageCropper"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import {
  useCookbooksList,
  useCreateCookbookMutation,
  useUploadCookbookCoverMutation,
} from "@/hooks/queries/useCookbooksQuery"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { useImageCropSession } from "@/hooks/useImageCropSession"
import { translate } from "@/i18n"
import { useAuthStore } from "@/stores/authStore"
import type { CookbookToAdd } from "@/types/cookbook"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { getImageUploadErrorMessage } from "@/utils/getImageUploadErrorMessage"
import { COOKBOOK_COVER_ASPECT } from "@/utils/imageCrop"
import {
  GETTING_STARTED_DEV_PREVIEW_KEY,
  shouldOpenCookbookAfterCreate,
} from "@/utils/gettingStarted"
import {
  advanceGettingStartedTour,
  completeGettingStartedTour,
  endGettingStartedTour,
  getGettingStartedTour,
  markGettingStartedStepDone,
  useGettingStartedTour,
} from "@/utils/gettingStartedTour"
import { storage } from "@/utils/storage"
import { cookbookSchema } from "@/validators/cookbookSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useFocusEffect } from "expo-router/react-navigation"
import { router } from "expo-router"
import { useCallback, useState } from "react"
import { useMMKVBoolean } from "react-native-mmkv"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, ImageStyle, View, ViewStyle } from "react-native"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export default function AddCookbookScreen() {
  const userId = useAuthStore((s) => s.userId)
  const tour = useGettingStartedTour()

  useFocusEffect(
    useCallback(() => {
      if (getGettingStartedTour()?.step === "cookbook") advanceGettingStartedTour("screen")
    }, []),
  )
  const createCookbook = useCreateCookbookMutation()
  const uploadCover = useUploadCookbookCoverMutation()
  const { data: cookbookPages } = useCookbooksList()
  const cookbookTotalCount = cookbookPages?.pages[0]?.totalCount
  const [devPreview = false] = useMMKVBoolean(GETTING_STARTED_DEV_PREVIEW_KEY, storage)
  const previewGettingStarted = __DEV__ && devPreview
  const { isInFlight, run } = useInFlightAction()

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CookbookFormInputs>({
    resolver: yupResolver(cookbookSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      image: null,
    },
  })

  const [imageLocal, setImageLocal] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const crop = useImageCropSession()

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert(translate("cookbookAddScreen:allowCameraRollAccess"))
      return
    }

    setIsUploading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 1,
      })

      if (result.canceled || !result.assets?.length) return
      const cropped = await crop.start(result.assets, COOKBOOK_COVER_ASPECT)
      if (!cropped?.length) return

      setImageLocal(cropped[0]?.uri ?? null)
      const uploadResponse = await uploadCover.mutateAsync(cropped)
      if (uploadResponse.ok) {
        setValue("image", uploadResponse.key)
      } else {
        setImageLocal(null)
        setValue("image", null)
        alert(
          getImageUploadErrorMessage(uploadResponse.problem, "cookbookAddScreen:imageUploadFailed"),
        )
      }
    } finally {
      setIsUploading(false)
    }
  }

  const onPressSend = useCallback(
    async (formData: CookbookFormInputs) => {
      setCreateError(null)
      const newCookbook: CookbookToAdd = {
        title: formData.title.trim(),
        image: formData.image,
      }
      try {
        const created = await createCookbook.mutateAsync(newCookbook)
        markGettingStartedStepDone(userId, "cookbook")
        if (
          shouldOpenCookbookAfterCreate(cookbookTotalCount, previewGettingStarted) &&
          created.cookbookId
        ) {
          router.replace(`/(logged-in)/cookbook/${created.cookbookId}`)
          return
        }
        router.dismissTo("/(logged-in)/(tabs)/cookbooks")
      } catch {
        setCreateError(translate("cookbookAddScreen:createFailed"))
      }
    },
    [createCookbook, cookbookTotalCount, previewGettingStarted, userId],
  )

  const handleSave = useCallback(() => {
    handleSubmit((data) => run(() => onPressSend(data)))()
  }, [handleSubmit, onPressSend, run])

  useHeader(
    {
      titleTx: "cookbookAddScreen:title",
      leftIcon: "back",
      rightTx: "common:save",
      onRightPress: isInFlight || isUploading ? undefined : handleSave,
      onLeftPress: () => router.back(),
    },
    [handleSave, isInFlight, isUploading],
  )

  return (
    <View style={$tourRoot}>
      <Screen preset="scroll" contentContainerStyle={$root}>
        <Text tx="cookbookAddScreen:subtitle" />
        <FormCard>
          {imageLocal && (
            <View style={$imagePreviewContainer}>
              <Image source={{ uri: imageLocal }} style={$imagePreview} contentFit="cover" />
            </View>
          )}

          <Button tx="cookbookAddScreen:addCoverPhoto" onPress={pickImage} disabled={isUploading} />

          {isUploading && <ActivityIndicator style={$uploadIndicator} />}

          <Divider size={spacing.xxl} line />

          <Controller
            name={"title"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                value={value}
                labelTx="cookbookAddScreen:titleLabel"
                onChangeText={(text) => {
                  onChange(text)
                  if (createError) setCreateError(null)
                }}
                placeholderTx="cookbookAddScreen:titlePlaceholder"
                status={errors.title || createError ? "error" : undefined}
                helper={errors.title?.message ?? createError ?? ""}
              />
            )}
          />
        </FormCard>
      </Screen>
      {tour?.step === "cookbook" && tour.phase === "screen" ? (
        <GettingStartedGuide
          revealScreen
          messageTx="gettingStarted:guideCookbookScreen"
          primaryTx="gettingStarted:gotIt"
          onPrimary={() => completeGettingStartedTour(userId)}
          onClose={endGettingStartedTour}
        />
      ) : null}
      {crop.pending ? (
        <ImageCropper
          key={crop.pending.asset.uri}
          asset={crop.pending.asset}
          aspect={crop.pending.aspect}
          onCancel={crop.cancel}
          onConfirm={crop.accept}
        />
      ) : null}
    </View>
  )
}

const $tourRoot: ViewStyle = {
  flex: 1,
}

const $root: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.md,
}

const $imagePreviewContainer: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
}

const $imagePreview: ImageStyle = {
  width: 200,
  height: 266,
  margin: 5,
  borderRadius: 8,
}

const $uploadIndicator: ViewStyle = {
  marginTop: spacing.sm,
}
