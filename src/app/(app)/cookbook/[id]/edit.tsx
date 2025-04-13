import { useEffect, useState } from "react"
import { View, Image, ViewStyle, ImageStyle, TextStyle, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { observer } from "mobx-react-lite"
import { useStores } from "src/models/helpers/useStores"
import { Text, TextField, Button, Screen, UseCase } from "src/components"
import { colors, spacing } from "src/theme"
import { ItemNotFound } from "src/components/ItemNotFound"
import * as ImagePicker from "expo-image-picker"
import { useHeader } from "src/utils/useHeader"
import { cookbookSchema } from "src/validators/cookbookSchema"

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
  const [isLoading, setIsLoading] = useState(false)
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

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  useHeader(
    {
      title: "Edit Cookbook",
      leftIcon: "back",
      onLeftPress: () => router.back(),
      rightText: "Save",
      onRightPress: () => handleSubmit(onPressSend, onError)(),
    },
    [handleSubmit],
  )

  const pickImage = async () => {
    setIsLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      })

      if (!result.canceled) {
        const imageUri = result.assets[0].uri
        setLocalImage(imageUri)
        setValue("image", imageUri)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const onPressSend = async (data: CookbookFormInputs) => {
    if (!cookbookStore.selected) return

    // Check if there are any changes
    if (
      data.title === cookbookStore.selected.title &&
      data.image === cookbookStore.selected.image
    ) {
      setResult("No changes to save")
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
        setResult("Cookbook updated successfully!")
      } else {
        setResult("Failed to update cookbook")
      }
    } catch (error) {
      console.error("Error updating cookbook:", error)
      setResult("An error occurred while updating the cookbook")
    } finally {
      setIsLoading(false)
    }
  }

  if (!cookbookStore.selected) {
    return <ItemNotFound message="Cookbook not found" />
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["bottom"]}
    >
      <Text text="Edit the details for your cookbook." />
      <UseCase name="">
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Title"
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
            text="Change Cover Photo"
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
                color: result.includes("successfully")
                  ? colors.palette.primary500
                  : colors.palette.angry500,
              },
            ]}
          />
        ) : null}
      </UseCase>
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
