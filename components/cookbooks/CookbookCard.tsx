import { Card } from "@/components/Card"
import { Text } from "@/components/Text"
import type { Cookbook } from "@/types/cookbook"
import {
  getCookbookMembersLabel,
  getCookbookRecipesLabel,
  parseCookbookTitle,
} from "@/utils/cookbookLabels"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { Image, ImageSource } from "expo-image"
import { router } from "expo-router"
import { useMemo } from "react"
import { ImageStyle, TextStyle, View, ViewStyle } from "react-native"

export interface CookbookCardProps {
  cookbook: Cookbook
  isDark: boolean
}

export function CookbookCard({ cookbook, isDark }: CookbookCardProps) {
  const { themed } = useAppTheme()

  const imageUri = useMemo<ImageSource | number>(() => {
    if (cookbook.image) {
      return { uri: cookbook.image }
    }
    return getCookbookImage(cookbook.id)
  }, [cookbook.id, cookbook.image])

  const handlePressCard = () => {
    router.push(`/(logged-in)/cookbook/${cookbook.id}`)
  }

  const $themedItem = [themed($item), themed($outline)]
  const $themedItemThumbnail = themed($itemThumbnail)
  const $themedMetadata = themed($metadata)
  const $themedMetadataText = themed($metadataText)
  const membersLabel = getCookbookMembersLabel(cookbook)
  const recipesLabel = getCookbookRecipesLabel(cookbook)
  const parsedTitle = parseCookbookTitle(cookbook.title)

  return (
    <Card
      style={$themedItem}
      verticalAlignment="force-footer-bottom"
      onPress={handlePressCard}
      preset={isDark ? "reversed" : "default"}
      accessibilityLabel={cookbook.title}
      HeadingComponent={
        <View style={$themedMetadata}>
          <Text style={$themedMetadataText} size="xxs" accessibilityLabel={membersLabel}>
            {membersLabel}
          </Text>
          <Text style={$themedMetadataText} size="xxs" accessibilityLabel={recipesLabel}>
            {recipesLabel}
          </Text>
        </View>
      }
      content={parsedTitle.title}
      contentStyle={$themedMetadataText}
      RightComponent={
        <Image
          source={imageUri}
          style={$themedItemThumbnail}
          contentFit="cover"
          recyclingKey={cookbook.id.toString()}
        />
      }
    />
  )
}

const $item: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  marginTop: theme.spacing.md,
  minHeight: 120,
  backgroundColor: theme.colors.backgroundDim,
})

const $itemThumbnail: ThemedStyle<ImageStyle> = (theme) => ({
  marginTop: theme.spacing.sm,
  height: 120,
  width: 90,
  alignSelf: "flex-start",
  borderRadius: 8,
})

const $metadata: ThemedStyle<ViewStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xs,
  flexDirection: "row",
})

const $metadataText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginEnd: theme.spacing.md,
  marginBottom: theme.spacing.xs,
})

const $outline: ThemedStyle<ViewStyle> = (theme) => ({
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
  borderWidth: 1,
  borderColor: theme.colors.separator,
})
