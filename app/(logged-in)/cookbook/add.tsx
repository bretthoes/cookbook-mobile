import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import {
  useCreateCookbookMutation,
  useUploadCookbookCoverMutation,
} from "@/hooks/queries/useCookbooksQuery"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { translate } from "@/i18n"
import type { CookbookToAddSnapshotIn } from "@/types/cookbook"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { getImageUploadErrorMessage } from "@/utils/getImageUploadErrorMessage"
import { cookbookSchema } from "@/validators/cookbookSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { useCallback, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, ImageStyle, View, ViewStyle } from "react-native"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export default function AddCookbookScreen() {
  const createCookbook = useCreateCookbookMutation()
  const uploadCover = useUploadCookbookCoverMutation()
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
        allowsEditing: true,
        aspect: [3, 4],
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageLocal(result.assets[0]?.uri ?? null)
        const uploadResponse = await uploadCover.mutateAsync(result.assets)
        if (uploadResponse.ok) {
          setValue("image", uploadResponse.key)
        } else {
          setImageLocal(null)
          setValue("image", null)
          alert(
            getImageUploadErrorMessage(
              uploadResponse.problem,
              "cookbookAddScreen:imageUploadFailed",
            ),
          )
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const onPressSend = useCallback(
    async (formData: CookbookFormInputs) => {
      setCreateError(null)
      const newCookbook: CookbookToAddSnapshotIn = {
        title: formData.title.trim(),
        image: formData.image,
      }
      try {
        await createCookbook.mutateAsync(newCookbook)
        router.replace("../../(tabs)/cookbooks")
      } catch {
        setCreateError(translate("cookbookAddScreen:createFailed"))
      }
    },
    [createCookbook],
  )

  const onError = useCallback((errors: unknown) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }, [])

  const handleSave = useCallback(() => {
    handleSubmit((data) => run(() => onPressSend(data)), onError)()
  }, [handleSubmit, onPressSend, onError, run])

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
    <Screen preset="scroll" contentContainerStyle={$root}>
      <Text tx="cookbookAddScreen:subtitle" />
      <FormCard>
        {imageLocal && (
          <View style={$imagePreviewContainer}>
            <AutoImage source={{ uri: imageLocal }} style={$imagePreview} />
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
  )
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
