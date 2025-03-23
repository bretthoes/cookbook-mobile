import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { ViewStyle, TouchableOpacity, View, TextStyle, Image, ImageStyle } from "react-native"
import { Screen, Text } from "src/components"
import { colors, spacing } from "src/theme"
import { router, useLocalSearchParams } from "expo-router"
import { useStores } from "src/models/helpers/useStores"
import { Cookbook } from "src/models"
import Ionicons from "@expo/vector-icons/Ionicons"
import * as ImagePicker from "expo-image-picker"
import { api } from "src/services/api"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useHeader } from "src/utils/useHeader"

// TODO i18n
export default observer(function SelectCookbookScreen() {
  const { cookbookStore, recipeStore: { setRecipeToAdd } } = useStores()
  const params = useLocalSearchParams<{ nextRoute: string; action: string; onSelect?: string }>()
  const { showActionSheetWithOptions } = useActionSheet()

  useHeader({
    leftIcon: "back",
    title: "Select a Cookbook",
    onLeftPress: () => router.back(),
  })

  useEffect(() => {
    cookbookStore.fetch() // Ensure we have latest cookbooks
  }, [])

  const handleAddRecipeFromCamera = async () => {
    console.log("handleAddRecipeFromCamera")
    // Request permission for accessing the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("Please allow camera roll access in settings.")
      return
    }
    console.log("handleAddRecipeFromCamera 2")
  
    const options = ["Take a Photo", "Select from Camera Roll", "Cancel"]
    const cancelButtonIndex = 2
    console.log("handleAddRecipeFromCamera 3")
    // Display the action sheet and get the user's choice
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        console.log("handleAddRecipeFromCamera 4")
        if (buttonIndex === 0) {
          // "Take a Photo" option was selected
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })
  
          if (!result.canceled && result.assets && result.assets.length > 0) {
            const uploadResponse = await api.extractRecipeFromImage(result.assets[0])
  
            if (uploadResponse.kind === "ok") {
              setRecipeToAdd(uploadResponse.recipe)
              router.replace("/(app)/recipe/add")
            } else {
              alert("Image parsing failed")
            }
          }
        } else if (buttonIndex === 1) {
          // "Select from Camera Roll" option was selected
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            allowsEditing: true,
          })
  
          if (!result.canceled && result.assets && result.assets.length > 0) {
            const uploadResponse = await api.extractRecipeFromImage(result.assets[0])
  
            if (uploadResponse.kind === "ok") {
              setRecipeToAdd(uploadResponse.recipe)
              router.replace("/(app)/recipe/add")
            } else {
              alert("Image parsing failed")
            }
          }
        }
      }
    )
  }

  const handleSelectCookbook = (cookbook: Cookbook) => {
    cookbookStore.setCurrentCookbook(cookbook)
    
    if (params.onSelect === "handleAddRecipeFromCamera") {
      handleAddRecipeFromCamera()
    } else {
      router.replace(params.nextRoute as any)
    }
  }

  const renderCookbookImage = (cookbook: Cookbook) => {
    if (cookbook.image) {
      return (
        <Image
          source={{ uri: cookbook.getImage }}
          style={$cookbookImage}
          defaultSource={require("assets/images/logo.png")}
        />
      )
    }
    return <Ionicons name="book" size={32} color={colors.tint} />
  }

  return (
    <Screen preset="scroll" style={$root}>
      <Text
        text={`${params.action}`}
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />

      <View style={$listContainer}>
        {cookbookStore.cookbooks.map((cookbook, index) => (
          <TouchableOpacity
            key={cookbook.id}
            style={[
              $itemContainer,
              index === 0 && $firstItem,
              index === cookbookStore.cookbooks.length - 1 && $lastItem,
            ]}
            onPress={() => handleSelectCookbook(cookbook)}
          >
            <View style={$iconContainer}>{renderCookbookImage(cookbook)}</View>
            <View style={$textContainer}>
              <Text preset="subheading" text={cookbook.title} style={$itemTitle} />
              <Text
                preset="formHelper"
                text={`${cookbook.members.textLabel}`}
                style={$itemDescription}
              />
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $title: ViewStyle = {
  marginBottom: spacing.lg,
  paddingHorizontal: spacing.lg,
}

const $listContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  marginHorizontal: spacing.lg,
  borderRadius: spacing.md,
}

const $itemContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
  minHeight: 80,
}

const $firstItem: ViewStyle = {
  borderTopLeftRadius: spacing.md,
  borderTopRightRadius: spacing.md,
}

const $lastItem: ViewStyle = {
  borderBottomWidth: 0,
  borderBottomLeftRadius: spacing.md,
  borderBottomRightRadius: spacing.md,
}

const $iconContainer: ViewStyle = {
  width: 48,
  height: 48,
  backgroundColor: colors.palette.neutral200,
  alignItems: "center",
  justifyContent: "center",
  marginRight: spacing.md,
  overflow: "hidden",
}

const $cookbookImage: ImageStyle = {
  width: 48,
  height: 48,
  borderRadius: 24,
}

const $textContainer: ViewStyle = {
  flex: 1,
  marginRight: spacing.sm,
}

const $itemTitle: TextStyle = {
  fontSize: 16,
  marginBottom: spacing.xs,
}

const $itemDescription: TextStyle = {
  color: colors.textDim,
  fontSize: 14,
}
