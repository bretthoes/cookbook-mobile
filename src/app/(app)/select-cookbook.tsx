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
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { getCookbookImage } from "src/utils/cookbookImages"

// TODO i18n
export default observer(function SelectCookbookScreen() {
  const {
    cookbookStore,
    recipeStore: { setRecipeToAdd },
  } = useStores()
  const params = useLocalSearchParams<{ nextRoute: string; action: string; onSelect?: string }>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()

  // Memoize themed styles
  const $themedRoot = React.useMemo(() => themed($root), [themed])
  const $themedTitle = React.useMemo(() => themed($title), [themed])
  const $themedListContainer = React.useMemo(() => themed($listContainer), [themed])
  const $themedItemContainer = React.useMemo(() => themed($itemContainer), [themed])
  const $themedFirstItem = React.useMemo(() => themed($firstItem), [themed])
  const $themedLastItem = React.useMemo(() => themed($lastItem), [themed])
  const $themedIconContainer = React.useMemo(() => themed($iconContainer), [themed])
  const $themedCookbookImage = React.useMemo(() => themed($cookbookImage), [themed])
  const $themedTextContainer = React.useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = React.useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = React.useMemo(() => themed($itemDescription), [themed])

  useHeader({
    leftIcon: "back",
    title: "Select a Cookbook",
    onLeftPress: () => router.back(),
  })

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      await cookbookStore.fetch()
    }
    // call the function
    setIsLoading(true)
    fetchData().catch(console.error)
    setIsLoading(false)
  }, [cookbookStore])

  const [isLoading, setIsLoading] = React.useState(false)

  const handleAddRecipeFromCamera = async () => {
    // Request permission for accessing the media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert("Please allow camera roll access in settings.")
      return
    }

    const options = ["Take a Photo", "Select from Camera Roll", "Cancel"]
    const cancelButtonIndex = 2
    // Display the action sheet and get the user's choice
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
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
      },
    )
  }

  const handleSelectCookbook = (cookbook: Cookbook) => {
    cookbookStore.setSelectedById(cookbook.id)

    if (params.onSelect === "handleAddRecipeFromCamera") {
      handleAddRecipeFromCamera()
    } else {
      router.push(params.nextRoute as any)
    }
  }

  const renderCookbookImage = (cookbook: Cookbook) => {
    if (cookbook.image) {
      return (
        <Image
          source={{ uri: cookbook.image }}
          style={$themedCookbookImage}
          defaultSource={getCookbookImage(cookbook.id) as any}
        />
      )
    }
    return <Image source={getCookbookImage(cookbook.id) as any} style={$themedCookbookImage} />
  }

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <Text
        text={`${params.action}`}
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />

      <View style={$themedListContainer}>
        {cookbookStore.cookbooks.map((cookbook, index) => (
          <TouchableOpacity
            key={cookbook.id}
            style={[
              $themedItemContainer,
              index === 0 && $themedFirstItem,
              index === cookbookStore.cookbooks.length - 1 && $themedLastItem,
            ]}
            onPress={() => handleSelectCookbook(cookbook)}
          >
            <View style={$themedIconContainer}>{renderCookbookImage(cookbook)}</View>
            <View style={$themedTextContainer}>
              <Text preset="subheading" text={cookbook.title} style={$themedItemTitle} />
              <Text
                preset="formHelper"
                text={`${cookbook.members.textLabel}`}
                style={$themedItemDescription}
              />
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  )
})

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
})

const $title: ThemedStyle<ViewStyle> = (theme) => ({
  marginBottom: theme.spacing.lg,
  paddingHorizontal: theme.spacing.lg,
})

const $listContainer: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  marginHorizontal: theme.spacing.lg,
  borderRadius: theme.spacing.md,
})

const $itemContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: theme.spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.background,
  minHeight: 80,
})

const $firstItem: ThemedStyle<ViewStyle> = (theme) => ({
  borderTopLeftRadius: theme.spacing.md,
  borderTopRightRadius: theme.spacing.md,
})

const $lastItem: ThemedStyle<ViewStyle> = (theme) => ({
  borderBottomWidth: 0,
  borderBottomLeftRadius: theme.spacing.md,
  borderBottomRightRadius: theme.spacing.md,
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  width: 48,
  height: 48,
  backgroundColor: theme.colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginRight: theme.spacing.md,
  overflow: "hidden",
})

const $cookbookImage: ThemedStyle<ImageStyle> = (theme) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
})

const $textContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  marginRight: theme.spacing.sm,
})

const $itemTitle: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  marginBottom: theme.spacing.xs,
})

const $itemDescription: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  fontSize: 14,
})
