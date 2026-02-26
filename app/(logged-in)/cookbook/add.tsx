import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { UseCase } from "@/components/UseCase"
import { translate } from "@/i18n"
import { CookbookToAddSnapshotIn } from "@/models/Cookbook"
import { useStores } from "@/models/helpers/useStores"
import { api } from "@/services/api"
import { spacing } from "@/theme"
import { useHeader } from "@/utils/useHeader"
import { cookbookSchema } from "@/validators/cookbookSchema"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { View, ViewStyle } from "react-native"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export default observer(function AddCookbookScreen() {
  const {
    cookbookStore: { create },
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
  const [createError, setCreateError] = useState<string | null>(null)

  // Image picker function
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert(translate("cookbookAddScreen:allowCameraRollAccess"))
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageLocal(result.assets[0]?.uri ?? "")
      const uploadResponse = await api.uploadImage(result.assets)
      if (uploadResponse.kind === "ok") {
        setValue("image", uploadResponse?.keys?.pop() ?? "")
      } else {
        alert(translate("cookbookAddScreen:imageSelectionFailed"))
      }
    }
  }

  const onPressSend = async (formData: CookbookFormInputs) => {
    setCreateError(null)
    const newCookbook: CookbookToAddSnapshotIn = {
      title: formData.title.trim(),
      image: formData.image,
    }
    try {
      const success = await create(newCookbook)
      if (success) {
        router.replace("../../(tabs)/cookbooks")
      } else {
        setCreateError(translate("cookbookAddScreen:createFailed"))
      }
    } catch {
      setCreateError(translate("cookbookAddScreen:createFailed"))
    }
  }

  const onError = (errors: any) => {
    console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
  }

  useHeader({
    titleTx: "cookbookAddScreen:title",
    leftIcon: "back",
    rightTx: "common:save",
    onRightPress: () => handleSubmit(onPressSend, onError)(),
    onLeftPress: () => router.back(),
  })

  return (
    <Screen preset="scroll" contentContainerStyle={$root}>
      <Text tx="cookbookAddScreen:subtitle" />
      <UseCase>
        {imageLocal.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            <AutoImage
              source={{ uri: imageLocal }}
              style={{ width: 200, height: 266, margin: 5, borderRadius: 8 }}
            />
          </View>
        )}

        <Button tx="cookbookAddScreen:addCoverPhoto" onPress={pickImage} />

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
      </UseCase>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
  marginHorizontal: spacing.md,
}
