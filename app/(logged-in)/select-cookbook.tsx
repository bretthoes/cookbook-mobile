import { EmptyState } from "@/components/EmptyState"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { isRTL } from "@/i18n"
import { Cookbook } from "@/models/Cookbook"
import { useStores } from "@/models/helpers/useStores"
import { api } from "@/services/api"
import type { ThemedStyle } from "@/theme"
import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { useHeader } from "@/utils/useHeader"
import { useActionSheet } from "@expo/react-native-action-sheet"
import { useFocusEffect } from "@react-navigation/native"
import * as ImagePicker from "expo-image-picker"
import { router, useLocalSearchParams } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  Pressable,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

function CookbookItem({
  cookbook,
  isFirst,
  isLast,
  onPress,
  selectedId,
  themed,
}: {
  cookbook: Cookbook
  isFirst: boolean
  isLast: boolean
  onPress: (cookbookId: number) => void
  selectedId: number | null
  themed: ReturnType<typeof useAppTheme>["themed"]
}) {
  const opacity = useSharedValue(1)
  const scale = useSharedValue(1)
  const cookbookId = cookbook.id

  const $themedItemContainer = React.useMemo(() => themed($itemContainer), [themed])
  const $themedFirstItem = React.useMemo(() => themed($firstItem), [themed])
  const $themedLastItem = React.useMemo(() => themed($lastItem), [themed])
  const $themedIconContainer = React.useMemo(() => themed($iconContainer), [themed])
  const $themedCookbookImage = React.useMemo(() => themed($cookbookImage), [themed])
  const $themedTextContainer = React.useMemo(() => themed($textContainer), [themed])
  const $themedItemTitle = React.useMemo(() => themed($itemTitle), [themed])
  const $themedItemDescription = React.useMemo(() => themed($itemDescription), [themed])

  // React to selection changes
  React.useEffect(() => {
    if (selectedId === null) {
      // Reset state
      opacity.value = withTiming(1, { duration: 150 })
      scale.value = withTiming(1, { duration: 150 })
    } else if (selectedId === cookbookId) {
      // This item is selected - scale up slightly
      scale.value = withTiming(1.02, { duration: 200 })
      opacity.value = withTiming(1, { duration: 200 })
    } else {
      // Other items - fade out
      opacity.value = withTiming(0.3, { duration: 250 })
      scale.value = withTiming(0.98, { duration: 250 })
    }
  }, [selectedId, cookbookId, opacity, scale])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  const handlePress = useCallback(() => {
    onPress(cookbookId)
  }, [cookbookId, onPress])

  const renderCookbookImage = () => {
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
    <Pressable onPress={handlePress} disabled={selectedId !== null}>
      <Animated.View
        style={[
          $themedItemContainer,
          isFirst && $themedFirstItem,
          isLast && $themedLastItem,
          animatedStyle,
        ]}
      >
        <View style={$themedIconContainer}>{renderCookbookImage()}</View>
        <View style={$themedTextContainer}>
          <Text preset="subheading" text={cookbook.title} style={$themedItemTitle} />
          <Text
            preset="formHelper"
            text={`${cookbook.members.textLabel}`}
            style={$themedItemDescription}
          />
        </View>
        <Icon icon="caretRight" size={24} color={colors.text} />
      </Animated.View>
    </Pressable>
  )
}

// TODO i18n
export default observer(function SelectCookbookScreen() {
  const {
    cookbookStore,
    recipeStore: { setRecipeToAdd },
  } = useStores()
  const params = useLocalSearchParams<{ nextRoute: string; action: string; onSelect?: string }>()
  const { showActionSheetWithOptions } = useActionSheet()
  const { themed } = useAppTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Reset selection state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSelectedId(null)
    }, []),
  )

  // Memoize themed styles
  const $themedRoot = React.useMemo(() => themed($root), [themed])
  const $themedListContainer = React.useMemo(() => themed($listContainer), [themed])
  const $themedEmptyState = React.useMemo(() => themed($emptyState), [themed])
  const $themedEmptyStateImage = React.useMemo(() => themed($emptyStateImage), [themed])

  useHeader({
    leftIcon: "back",
    title: "Select a Cookbook",
    onLeftPress: () => router.back(),
  })

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await cookbookStore.fetch()
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    // call the function
    fetchData()
  }, [cookbookStore])

  const handleAddRecipeFromCamera = useCallback(async () => {
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
              router.replace("./recipe/add")
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
              router.replace("./recipe/add")
            } else {
              alert("Image parsing failed")
            }
          }
        }
      },
    )
  }, [showActionSheetWithOptions, setRecipeToAdd])

  const handleItemPress = useCallback(
    (cookbookId: number) => {
      setSelectedId(cookbookId)
      cookbookStore.setSelectedById(cookbookId)

      // Navigate after the fade animation completes
      setTimeout(() => {
        if (params.onSelect === "handleAddRecipeFromCamera") {
          handleAddRecipeFromCamera()
        } else {
          router.push(params.nextRoute as any)
        }
      }, 350)
    },
    [cookbookStore, params.onSelect, params.nextRoute, handleAddRecipeFromCamera],
  )

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <Text
        text={`${params.action}`}
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />

      {isLoading ? (
        <View style={{ marginTop: spacing.xxl, alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : cookbookStore.cookbooks.length === 0 ? (
        <EmptyState
          preset="generic"
          style={$themedEmptyState}
          content="No cookbooks have been added yet."
          imageStyle={$themedEmptyStateImage}
          ImageProps={{ resizeMode: "contain" }}
        />
      ) : (
        <View style={$themedListContainer}>
          {cookbookStore.cookbooks.map((cookbook, index) => (
            <CookbookItem
              key={cookbook.id}
              cookbook={cookbook}
              isFirst={index === 0}
              isLast={index === cookbookStore.cookbooks.length - 1}
              onPress={handleItemPress}
              selectedId={selectedId}
              themed={themed}
            />
          ))}
        </View>
      )}
    </Screen>
  )
})

const $root: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
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

const $cookbookImage: ThemedStyle<ImageStyle> = () => ({
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

const $emptyState: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.xxl,
  paddingHorizontal: theme.spacing.md,
})

const $emptyStateImage: ThemedStyle<ImageStyle> = () => ({
  transform: [{ scaleX: isRTL ? -1 : 1 }],
})
