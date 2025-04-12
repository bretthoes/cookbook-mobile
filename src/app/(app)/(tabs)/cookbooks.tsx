import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo } from "react"
import {
  AccessibilityProps,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { type ContentStyle } from "@shopify/flash-list"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import {
  Button,
  ButtonAccessoryProps,
  Card,
  EmptyState,
  Icon,
  ListView,
  Screen,
  Switch,
  Text,
} from "src/components"
import { isRTL, translate } from "src/i18n"
import { colors, spacing } from "src/theme"
import { delay } from "src/utils/delay"
import { Cookbook } from "src/models"
import { router } from "expo-router"
import { useStores } from "src/models/helpers/useStores"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

const ICON_SIZE = 14

const rnrImage1 = require("assets/images/cookbooks/blue.png")
const rnrImage2 = require("assets/images/cookbooks/green.png")
const rnrImage3 = require("assets/images/cookbooks/orange.png")
const rnrImage4 = require("assets/images/cookbooks/purple.png")
const rnrImage5 = require("assets/images/cookbooks/pink.png")
const rnrImage6 = require("assets/images/cookbooks/yellow.png")
const rnrImages = [rnrImage1, rnrImage2, rnrImage3, rnrImage4, rnrImage5, rnrImage6]

export default observer(function DemoPodcastListScreen(_props) {
  const { cookbookStore } = useStores()
  const { themeContext } = useAppTheme()
  const isDark = themeContext === "dark"

  const [refreshing, setRefreshing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    const fetchData = async () => {
      await cookbookStore.fetch()
    }
    setIsLoading(true)
    fetchData()
    setIsLoading(false)
  }, [cookbookStore])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([cookbookStore.fetch(), delay(750)])
    setRefreshing(false)
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={$screenContentContainer}>
      <ListView<Cookbook>
        contentContainerStyle={$listContentContainer}
        data={cookbookStore.cookbooksForList.slice()}
        extraData={cookbookStore.favorites.length + cookbookStore.cookbooks.length}
        refreshing={refreshing}
        estimatedItemSize={233}
        onRefresh={manualRefresh}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              headingTx={
                cookbookStore.favoritesOnly
                  ? "demoPodcastListScreen:noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                cookbookStore.favoritesOnly
                  ? "demoPodcastListScreen:noFavoritesEmptyState.content"
                  : undefined
              }
              button={cookbookStore.favoritesOnly ? "" : undefined}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="demoPodcastListScreen:title" />
            {(cookbookStore.favoritesOnly || cookbookStore.cookbooksForList.length > 0) && (
              <View style={$toggle}>
                <Switch
                  value={cookbookStore.favoritesOnly}
                  onValueChange={() =>
                    cookbookStore.setProp("favoritesOnly", !cookbookStore.favoritesOnly)
                  }
                  labelTx="demoPodcastListScreen:onlyFavorites"
                  labelPosition="left"
                  labelStyle={$labelStyle}
                  accessibilityLabel={translate("demoPodcastListScreen:accessibility.switch")}
                />
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <CookbookCard
            cookbook={item}
            isFavorite={cookbookStore.hasFavorite(item)}
            onPressFavorite={() => cookbookStore.toggleFavorite(item)}
            isDark={isDark}
          />
        )}
      />
    </Screen>
  )
})

const CookbookCard = observer(function CookbookCard({
  cookbook,
  isFavorite,
  onPressFavorite,
  isDark,
}: {
  cookbook: Cookbook
  onPressFavorite: () => void
  isFavorite: boolean
  isDark: boolean
}) {
  const { themed } = useAppTheme()
  const liked = useSharedValue(isFavorite ? 1 : 0)

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (cookbook.image) {
      return { uri: `${cookbook.getImage}` }
    } else {
      return rnrImages[Math.floor(Math.random() * rnrImages.length)]
    }
  }, [cookbook.image])

  // Grey heart
  const animatedLikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.EXTEND),
        },
      ],
      opacity: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    }
  })

  // Pink heart
  const animatedUnlikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value,
    }
  })

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityLabel: cookbook.title,
          accessibilityHint: translate("demoPodcastListScreen:accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: cookbook.title,
          accessibilityActions: [
            {
              name: "longpress",
              label: translate("demoPodcastListScreen:accessibility.favoriteAction"),
            },
          ],
          onAccessibilityAction: ({ nativeEvent }) => {
            if (nativeEvent.actionName === "longpress") {
              handlePressFavorite()
            }
          },
        },
      }),
    [cookbook, isFavorite],
  )

  const handlePressFavorite = () => {
    onPressFavorite()
    liked.value = withSpring(liked.value ? 0 : 1)
  }

  const handlePressCard = () => {
    router.push(`/(app)/cookbook/${cookbook.id}`)
  }

  const ButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function ButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[themed($iconContainer), StyleSheet.absoluteFill, animatedLikeButtonStyles]}
            >
              <Icon icon="heart" size={ICON_SIZE} color={isDark ? colors.border : colors.text} />
            </Animated.View>
            <Animated.View style={[themed($iconContainer), animatedUnlikeButtonStyles]}>
              <Icon icon="heart" size={ICON_SIZE} color={colors.palette.primary400} />
            </Animated.View>
          </View>
        )
      },
    [isDark, themed],
  )

  const $themedItem = useMemo(() => themed($item), [themed])
  const $themedItemThumbnail = useMemo(() => themed($itemThumbnail), [themed])
  const $themedMetadata = useMemo(() => themed($metadata), [themed])
  const $themedMetadataText = useMemo(() => themed($metadataText), [themed])
  const $themedFavoriteButton = useMemo(() => themed($favoriteButton), [themed])
  const $themedUnFavoriteButton = useMemo(() => themed($unFavoriteButton), [themed])

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
      {...accessibilityHintProps}
      RightComponent={<Image source={imageUri} style={$themedItemThumbnail} />}
      FooterComponent={
        <Button
          onPress={handlePressFavorite}
          onLongPress={handlePressFavorite}
          style={[$themedFavoriteButton, isFavorite && $themedUnFavoriteButton]}
          accessibilityLabel={
            isFavorite
              ? translate("demoPodcastListScreen:accessibility.unfavoriteIcon")
              : translate("demoPodcastListScreen:accessibility.favoriteIcon")
          }
          LeftAccessory={ButtonLeftAccessory}
        >
          <Text
            size="xxs"
            weight="medium"
            text={
              isFavorite
                ? translate("demoPodcastListScreen:unfavoriteButton")
                : translate("demoPodcastListScreen:favoriteButton")
            }
          />
        </Button>
      }
    />
  )
})

const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ContentStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.xxxl + spacing.xxl,
}

const $heading: ViewStyle = {
  marginBottom: spacing.md,
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
  resizeMode: "cover",
  borderRadius: 8,
  shadowColor: theme.colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $toggle: ViewStyle = {
  marginTop: spacing.md,
}

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  height: ICON_SIZE,
  width: ICON_SIZE,
  flexDirection: "row",
  marginEnd: theme.spacing.sm,
})

const $metadata: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xs,
  flexDirection: "row",
})

const $metadataText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginEnd: theme.spacing.md,
  marginBottom: theme.spacing.xs,
})

const $favoriteButton: ThemedStyle<ViewStyle> = (theme) => ({
  borderRadius: 17,
  marginTop: theme.spacing.md,
  justifyContent: "flex-start",
  backgroundColor: theme.colors.tintInactive,
  borderColor: theme.colors.tintInactive,
  paddingHorizontal: theme.spacing.md,
  paddingTop: theme.spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
})

const $unFavoriteButton: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.palette.primary100,
  backgroundColor: theme.colors.palette.primary100,
})

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}
