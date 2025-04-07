import React, { useEffect, useState } from "react"
import { View, Image, ViewStyle, ImageStyle, TextStyle } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { observer } from "mobx-react-lite"
import { useStores } from "src/models/helpers/useStores"
import { Text, TextField, Button, Screen } from "src/components"
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
  cookbookStore.setCurrentCookbook(Number(id))

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CookbookFormInputs>({
    resolver: yupResolver(cookbookSchema),
    defaultValues: {
      title: cookbookStore.currentCookbook?.title || "",
      image: cookbookStore.currentCookbook?.image || null,
    },
  })

  useEffect(() => {
    if (cookbookStore.currentCookbook) {
      setValue("title", cookbookStore.currentCookbook.title)
      setValue("image", cookbookStore.currentCookbook.image)
      setLocalImage(cookbookStore.currentCookbook.image)
    }
  }, [cookbookStore.currentCookbook, setValue])

  useHeader({
    title: "Edit Cookbook",
    leftIcon: "back",
    onLeftPress: () => router.back(),
    rightText: "Save",
    onRightPress: () => handleSubmit(onPressSend),
  }, [handleSubmit])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    })

    if (!result.canceled) {
      const imageUri = result.assets[0].uri
      setLocalImage(imageUri)
      setValue("image", imageUri)
    }
  }

  const onPressSend = async (data: CookbookFormInputs) => {
    if (!cookbookStore.currentCookbook) return

    // Check if there are any changes
    if (data.title === cookbookStore.currentCookbook.title && data.image === cookbookStore.currentCookbook.image) {
      setResult("No changes to save")
      return
    }

    try {
      const success = await cookbookStore.update({
        id: cookbookStore.currentCookbook.id,
        title: data.title,
        image: data.image,
        author: cookbookStore.currentCookbook.author,
        authorEmail: cookbookStore.currentCookbook.authorEmail,
        membersCount: cookbookStore.currentCookbook.membersCount,
        recipeCount: cookbookStore.currentCookbook.recipeCount,
      })

      if (success) {
        setResult("Cookbook updated successfully!")
        // Force a refresh of the cookbooks list
        await cookbookStore.fetch()
        router.back()
      } else {
        setResult("Failed to update cookbook")
      }
    } catch (error) {
      console.error("Error updating cookbook:", error)
      setResult("An error occurred while updating the cookbook")
    }
  }

  if (!cookbookStore.currentCookbook) {
    return <ItemNotFound message="Cookbook not found" />
  }

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={$screenContentContainer}
      safeAreaEdges={["bottom"]}
    >
      <View style={$container}>
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
          />
        </View>

        {result ? (
          <Text
            text={result}
            style={[
              $result,
              { color: result.includes("successfully") ? colors.palette.primary500 : colors.palette.angry500 },
            ]}
          />
        ) : null}

        <Button
          text="Save Changes"
          onPress={handleSubmit(onPressSend)}
          style={$button}
        />
      </View>
    </Screen>
  )
})

const $screenContentContainer: ViewStyle = {
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.lg,
}

const $container: ViewStyle = {
  padding: spacing.lg,
}

const $imageContainer: ViewStyle = {
  marginTop: spacing.lg,
  alignItems: "center",
}

const $image: ImageStyle = {
  width: "100%",
  height: 200,
  borderRadius: 8,
  marginBottom: spacing.sm,
}

const $imagePlaceholder: ViewStyle = {
  width: "100%",
  height: 200,
  backgroundColor: colors.palette.neutral300,
  borderRadius: 8,
  marginBottom: spacing.sm,
}

const $imageButton: ViewStyle = {
  marginTop: spacing.sm,
}

const $button: ViewStyle = {
  marginTop: spacing.xl,
}

const $result: TextStyle = {
  marginTop: spacing.lg,
  textAlign: "center",
}
