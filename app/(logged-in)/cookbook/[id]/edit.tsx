import { Button } from "@/components/Button"
import { ItemNotFound } from "@/components/ItemNotFound"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { FormCard } from "@/components/FormCard"
import { useInFlightAction } from "@/hooks/useInFlightAction"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import { colors, spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { cookbookSchema } from "@/validators/cookbookSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export default observer(function EditCookbookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { cookbookStore } = useStores()
  const [localImage, setLocalImage] = useState<string | null>(null)
  const [result, setResult] = useState<string>("")
  const [resultIsSuccess, setResultIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { isInFlight, run } = useInFlightAction()
  cookbookStore.setSelectedById(Number(id))

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CookbookFormInputs>({
    resolver: yupResolver(cookbookSchema),
    defaultValues: {
      title: cookbookStore.selected?.title || "",
      image: cookbookStore.selected?.image || null,
    },
  })

  useEffect(() => {
    if (cookbookStore.selected) {
      setValue("title", cookbookStore.selected.title)
      setValue("image", cookbookStore.selected.image)
      setLocalImage(cookbookStore.selected.image)
    }
  }, [cookbookStore.selected, setValue])

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
        const previousImage = cookbookStore.selected?.image ?? null
        // Show local URI immediately for a snappy preview while the upload runs.
        setLocalImage(result.assets[0].uri)

        const uploadResponse = await cookbookStore.uploadCookbookCover(result.assets)
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
      if (!cookbookStore.selected) return

      if (
        data.title === cookbookStore.selected.title &&
        data.image === cookbookStore.selected.image
      ) {
        setResult(translate("cookbookEditScreen:noChangesToSave"))
        setResultIsSuccess(false)
        return
      }

      setIsLoading(true)
      try {
        const success = await cookbookStore.update({
          id: cookbookStore.selected.id,
          title: data.title,
          image: data.image,
          author: cookbookStore.selected.author,
          authorEmail: cookbookStore.selected.authorEmail,
          membersCount: cookbookStore.selected.membersCount,
          recipeCount: cookbookStore.selected.recipeCount,
        })

        if (success) {
          setResult(translate("cookbookEditScreen:updatedSuccessfully"))
          setResultIsSuccess(true)
        } else {
          setResult(translate("cookbookEditScreen:failedToUpdate"))
          setResultIsSuccess(false)
        }
      } catch (error) {
        console.error("Error updating cookbook:", error)
        setResult(translate("cookbookEditScreen:errorUpdating"))
        setResultIsSuccess(false)
      } finally {
        setIsLoading(false)
      }
    },
    [cookbookStore],
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

  if (!cookbookStore.selected) {
    return <ItemNotFound message={translate("cookbookEditScreen:notFound")} />
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["bottom"]}
    >
      <Text tx="cookbookEditScreen:subtitle" />
      <FormCard>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextField
              labelTx="cookbookEditScreen:titleLabel"
              value={value}
              onChangeText={onChange}
              helper={errors.title?.message}
              autoCapitalize="none"
            />
          )}
        />

        <View style={$imageContainer}>
          {localImage ? (
            <Image source={{ uri: localImage }} style={$image} />
          ) : (
            <View style={$imagePlaceholder} />
          )}
          <Button
            tx="cookbookEditScreen:changeCoverPhoto"
            onPress={pickImage}
            style={$imageButton}
            disabled={isLoading}
          />
        </View>

        {isLoading && <ActivityIndicator />}
        {result ? (
          <Text
            text={result}
            style={[
              $result,
              {
                color: resultIsSuccess ? colors.palette.primary500 : colors.palette.angry500,
              },
            ]}
          />
        ) : null}
      </FormCard>
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
}

const $imageContainer: ViewStyle = {
  marginTop: spacing.lg,
  alignItems: "center",
}

const $image: ImageStyle = {
  width: "100%",
  height: 266,
  borderRadius: 8,
  marginBottom: spacing.sm,
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}

const $imagePlaceholder: ViewStyle = {
  width: "100%",
  height: 266,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 8,
  marginBottom: spacing.sm,
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
}

const $imageButton: ViewStyle = {
  marginTop: spacing.sm,
}

const $result: TextStyle = {
  marginTop: spacing.lg,
  textAlign: "center",
}
