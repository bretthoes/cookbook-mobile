import { Button } from "@/components/Button"
import { ItemNotFound } from "@/components/ItemNotFound"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import {
  useCookbookById,
  useUpdateCookbookMutation,
  useUploadCookbookCoverMutation,
} from "@/hooks/queries/useCookbooksQuery"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { useUiStore } from "@/stores/uiStore"
import { translate } from "@/i18n"
import { colors, spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { cookbookSchema } from "@/validators/cookbookSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export default function EditCookbookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const cookbookId = Number(id)
  const setSelectedCookbookId = useUiStore((s) => s.setSelectedCookbookId)
  const { cookbook: selected } = useCookbookById(cookbookId)
  const updateCookbook = useUpdateCookbookMutation()
  const uploadCover = useUploadCookbookCoverMutation()
  const [localImage, setLocalImage] = useState<string | null>(null)
  const [result, setResult] = useState<string>("")
  const [resultIsSuccess, setResultIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isInFlight, run } = useInFlightAction()

  useEffect(() => {
    setSelectedCookbookId(cookbookId)
  }, [cookbookId, setSelectedCookbookId])

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CookbookFormInputs>({
    resolver: yupResolver(cookbookSchema),
    defaultValues: {
      title: selected?.title || "",
      image: selected?.image || null,
    },
  })

  useEffect(() => {
    if (selected) {
      setValue("title", selected.title)
      setValue("image", selected.image ?? null)
      setLocalImage(selected.image ?? null)
    }
  }, [selected, setValue])

  const onError = useCallback((errors: unknown) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }, [])

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert(translate("cookbookEditScreen:allowCameraRollAccess"))
      return
    }

    setIsLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const previousImage = selected?.image ?? null
        setLocalImage(result.assets[0].uri)

        const uploadResponse = await uploadCover.mutateAsync(result.assets)
        if (uploadResponse.ok) {
          setValue("image", uploadResponse.key)
        } else {
          alert(translate("cookbookEditScreen:imageUploadFailed"))
          setLocalImage(previousImage)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onPressSend = useCallback(
    async (data: CookbookFormInputs) => {
      if (!selected) return

      if (data.title === selected.title && data.image === selected.image) {
        setResult(translate("cookbookEditScreen:noChangesToSave"))
        setResultIsSuccess(false)
        return
      }

      setIsLoading(true)
      try {
        await updateCookbook.mutateAsync({
          id: selected.id,
          title: data.title,
          image: data.image,
          author: selected.author ?? null,
          authorEmail: selected.authorEmail ?? null,
          membersCount: selected.membersCount ?? 0,
          recipeCount: selected.recipeCount ?? 0,
        })
        setResult(translate("cookbookEditScreen:updatedSuccessfully"))
        setResultIsSuccess(true)
      } catch (error) {
        console.error("Error updating cookbook:", error)
        setResult(translate("cookbookEditScreen:errorUpdating"))
        setResultIsSuccess(false)
      } finally {
        setIsLoading(false)
      }
    },
    [selected, updateCookbook],
  )

  const handleSave = useCallback(() => {
    handleSubmit((data) => run(() => onPressSend(data)), onError)()
  }, [handleSubmit, onPressSend, onError, run])

  useHeader(
    {
      titleTx: "cookbookEditScreen:title",
      leftIcon: "back",
      onLeftPress: () => router.back(),
      rightTx: "common:save",
      onRightPress: isInFlight || isLoading ? undefined : handleSave,
    },
    [handleSave, isInFlight, isLoading],
  )

  if (!selected) {
    return <ItemNotFound message={translate("cookbookEditScreen:notFound")} />
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$root}
      safeAreaEdges={["bottom"]}
      keyboardOffset={100}
    >
      <FormCard>
        {localImage && (
          <View style={$imagePreviewContainer}>
            <Image source={{ uri: localImage }} style={$imagePreview} />
          </View>
        )}

        <Button tx="cookbookEditScreen:changeCoverPhoto" onPress={pickImage} disabled={isLoading} />

        {isLoading && <ActivityIndicator style={$uploadIndicator} />}

        <Controller
          name="title"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value}
              labelTx="cookbookEditScreen:titleLabel"
              onChangeText={onChange}
              placeholderTx="cookbookEditScreen:titlePlaceholder"
              status={errors.title ? "error" : undefined}
              helper={errors.title?.message}
            />
          )}
        />

        {result ? (
          <Text
            text={result}
            style={[$resultText, resultIsSuccess ? $resultSuccess : $resultError]}
          />
        ) : null}
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

const $resultText: TextStyle = {
  marginTop: spacing.md,
  textAlign: "center",
}

const $resultSuccess: TextStyle = {
  color: colors.palette.primary500,
}

const $resultError: TextStyle = {
  color: colors.palette.angry500,
}
