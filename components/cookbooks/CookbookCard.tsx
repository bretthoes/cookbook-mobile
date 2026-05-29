import { Card } from "@/components/Card"
import { FavoriteAnimatedButton } from "@/components/FavoriteAnimatedButton"
import { Text } from "@/components/Text"
import { Cookbook } from "@/models/Cookbook"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { Image, ImageSource } from "expo-image"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { AccessibilityProps, ImageStyle, Platform, TextStyle, View, ViewStyle } from "react-native"

export interface CookbookCardProps {
  cookbook: Cookbook
  isFavorite: boolean
  onPressFavorite: () => void
  isDark: boolean
}

export const CookbookCard = observer(function CookbookCard({
  cookbook,
  isFavorite,
  onPressFavorite,
  isDark,
}: CookbookCardProps) {
  const { themed } = useAppTheme()
  const { t } = useTranslation()

  const imageUri = useMemo<ImageSource | number>(() => {
    if (cookbook.image) {
      return { uri: cookbook.image }
    }
    return getCookbookImage(cookbook.id)
  }, [cookbook.id, cookbook.image])

  const handlePressFavorite = useCallback(() => {
    onPressFavorite()
  }, [onPressFavorite])

  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityLabel: cookbook.title,
          accessibilityHint: t("cookbooksScreen:cookbookListScreen.accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: cookbook.title,
          accessibilityActions: [
            {
              name: "longpress",
              label: t("cookbooksScreen:cookbookListScreen.accessibility.favoriteAction"),
            },
          ],
          onAccessibilityAction: ({ nativeEvent }) => {
            if (nativeEvent.actionName === "longpress") {
              handlePressFavorite()
            }
          },
        },
      }),
    [cookbook.title, isFavorite, handlePressFavorite, t],
  )

  const handlePressCard = () => {
    router.push(`/(logged-in)/cookbook/${cookbook.id}`)
  }

  const $themedItem = themed($item)
  const $themedItemThumbnail = themed($itemThumbnail)
  const $themedMetadata = themed($metadata)
  const $themedMetadataText = themed($metadataText)

  return (
    <Card
      style={$themedItem}
      verticalAlignment="force-footer-bottom"
      onPress={handlePressCard}
      onLongPress={handlePressFavorite}
      preset={isDark ? "reversed" : "default"}
      HeadingComponent={
        <View style={$themedMetadata}>
          <Text
            style={$themedMetadataText}
            size="xxs"
            accessibilityLabel={cookbook.members.accessibilityLabel}
          >
            {cookbook.members.textLabel}
          </Text>
          <Text
            style={$themedMetadataText}
            size="xxs"
            accessibilityLabel={cookbook.recipes.accessibilityLabel}
          >
            {cookbook.recipes.textLabel}
          </Text>
        </View>
      }
      content={cookbook.parsedTitleAndSubtitle.title}
      contentStyle={$themedMetadataText}
      {...accessibilityHintProps}
      RightComponent={
        <Image
          source={imageUri}
          style={$themedItemThumbnail}
          contentFit="cover"
          recyclingKey={cookbook.id.toString()}
        />
      }
      FooterComponent={
        <FavoriteAnimatedButton
          isFavorite={isFavorite}
          isDark={isDark}
          onPress={handlePressFavorite}
        />
      }
    />
  )
})

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
