import { Button, TextField, Text, Screen, AutoImage } from "src/components"
import { spacing } from "src/theme"
import React, { useState } from "react"
import { View, ViewStyle } from "react-native"
import { Divider } from "src/components/Divider"
import { useStores } from "src/models/helpers/useStores"
import { observer } from "mobx-react-lite"
import * as yup from "yup"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { api } from "src/services/api"
import { CookbookToAddSnapshotIn } from "src/models/Cookbook"
import { UseCase } from "src/components/UseCase"
import { router } from "expo-router"
import { cookbookSchema } from "src/validators/cookbookSchema"
import { useHeader } from "src/utils/useHeader"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export default observer(function AddCookbookScreen() {
  const {
    cookbookStore: { create, selected },
  } = useStores()

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

  const [imageLocal, setImageLocal] = useState("")

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("Please allow camera roll access in settings.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageLocal(result.assets[0]?.uri ?? "")
      const uploadResponse = await api.uploadImage(result.assets)
      if (uploadResponse.kind === "ok") {
        setValue("image", uploadResponse?.keys?.pop() ?? "")
      } else {
        alert("Image selection failed")
      }
    }
  }

  const onPressSend = async (formData: CookbookFormInputs) => {
    const newCookbook: CookbookToAddSnapshotIn = {
      title: formData.title.trim(),
      image: formData.image,
    }
    try {
      await create(newCookbook)
      if (selected) router.replace(`/(app)/cookbooks`)
      else alert("Failed to create cookbook")
    } catch (e) {
      alert("Add cookbook failed")
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  useHeader({
    title: "Add new cookbook",
    leftIcon: "back",
    rightText: "Save",
    onRightPress: () => handleSubmit(onPressSend, onError)(),
    onLeftPress: () => router.back(),
  })

  return (
    <Screen preset="scroll" contentContainerStyle={$root}>
      <Text text="Fill out the details for your new cookbook." />
      <UseCase name="">
        {imageLocal.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            <AutoImage
              source={{ uri: imageLocal }}
              style={{ width: 200, height: 266, margin: 5, borderRadius: 8 }}
            />
          </View>
        )}

        <Button text="Add cover photo (optional)" onPress={pickImage} />

        <Divider size={spacing.xxl} line />

        <Controller
          name={"title"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextField
              value={value}
              label="Title"
              onChangeText={onChange}
              placeholder="Enter cookbook title"
              status="error"
              helper={errors.title?.message ?? ""}
            />
          )}
        />
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.md,
}
