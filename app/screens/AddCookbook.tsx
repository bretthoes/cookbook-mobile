import { Button, TextField, Text, Screen, AutoImage } from "app/components"
import { spacing } from "app/theme"
import React, { FC, useState } from "react"
import { View, ViewStyle } from "react-native"
import { DemoUseCase } from "./DemoShowroomScreen/DemoUseCase"
import { DemoDivider } from "./DemoShowroomScreen/DemoDivider"
import { useStores } from "app/models"
import { DemoTabScreenProps } from "app/navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import * as yup from "yup"
import { Controller, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as ImagePicker from "expo-image-picker"
import { api } from "app/services/api"
import { CookbookToAddSnapshotIn } from "app/models/Cookbook"

interface CookbookFormInputs {
  title: string
  image: string | null
}

export const AddCookbookScreen: FC<DemoTabScreenProps<"AddCookbook">> = observer(
  function AddCookbokScreen(_props) {
    const { cookbookStore } = useStores()

    const schema = yup.object().shape({
      title: yup
        .string()
        .required("Title is required")
        .min(3, "Title at least 3 characters")
        .max(255, "Title at most 255 characters"),
      image: yup
        .string()
        .nullable()
        .defined()
    })

    const {
      control,
      handleSubmit,
      formState: { errors },
      setValue,
    } = useForm<CookbookFormInputs>({
      resolver: yupResolver(schema),
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
      if (status !== 'granted') {
        alert('Please allow camera roll access in settings.')
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
      })
      

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageLocal(result.assets?.pop()?.uri ?? "")
        const uploadResponse = await api.uploadImage(result.assets);
        if (uploadResponse.kind === "ok") {
          setValue("image", uploadResponse?.keys?.pop() ?? "");
        } else {
          alert("Image selection failed");
        }
      }
    }

    const onPressSend = async (formData: CookbookFormInputs) => {
      const newCookbook: CookbookToAddSnapshotIn = {
        title: formData.title.trim(),
        image: formData.image
      }
      
      await cookbookStore.createCookbook(newCookbook)
    }

    const onError = (errors: any) => {
      console.debug("Form validation errors:", JSON.stringify(errors, null, 2))
    }

    return (
      <Screen
        preset="scroll"
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContentContainer}
      >
        <View style={$titleContainer}>
          <Text preset="heading" weight="normal" text="Add new cookbook" />
          <Button
            text="Save"
            style={$buttonHeightOverride}
            onPress={handleSubmit(onPressSend, onError)}
          />
        </View>

        <DemoUseCase name="" description="Fill out the details for your new cookbook.">

        {imageLocal.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            <AutoImage
              source={{ uri: imageLocal}}
              style={{ width: 300, height: 300, margin: 5 }} // TODO: update static dimensions
              />
          </View>
        )}
        
          <Button text="Add cover photo (optional)" onPress={pickImage} />

          <DemoDivider size={spacing.xxl} line />

          <Controller
            name={"title"}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                value={value}
                onChangeText={onChange}
                placeholder="Enter cookbook title"
                status="error"
                helper={errors.title?.message ?? ""}
              />
            )}
          />
        </DemoUseCase>
      </Screen>
    )
  },
)

// #region Styles
const $screenContentContainer: ViewStyle = {
  marginHorizontal: spacing.md,
  marginTop: spacing.xl,
}

const $titleContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $buttonHeightOverride: ViewStyle = {
  minHeight: spacing.md,
}
// #endregion
