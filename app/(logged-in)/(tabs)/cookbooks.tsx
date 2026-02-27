import { Button, ButtonAccessoryProps } from "@/components/Button"
import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle"
import { isRTL } from "@/i18n"
import { Cookbook } from "@/models/Cookbook"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { delay } from "@/utils/delay"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { ComponentType, useCallback, useEffect, useMemo, useState } from "react"
import {
  AccessibilityProps,
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import { useTranslation } from "react-i18next"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

const ICON_SIZE = 14

export default observer(function DemoPodcastListScreen(_props) {
  const { cookbookStore } = useStores()
  const { themeContext } = useAppTheme()
  const { t } = useTranslation()
  const isDark = themeContext === "dark"

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
      <FlatList<Cookbook>
        contentContainerStyle={$listContentContainer}
        data={cookbookStore.cookbooksForList.slice()}
        extraData={cookbookStore.favorites.length + cookbookStore.cookbooks.length}
        refreshing={refreshing}
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
                  ? "demoPodcastListScreen:cookbookListScreen.noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                cookbookStore.favoritesOnly
                  ? "demoPodcastListScreen:cookbookListScreen.noFavoritesEmptyState.content"
                  : "demoPodcastListScreen:cookbookListScreen.noCookbooksEmptyState"
              }
              contentTxOptions={
                cookbookStore.favoritesOnly
                  ? undefined
                  : { tabName: t("demoNavigator:createTab") }
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
                  accessibilityLabel={t("demoPodcastListScreen:accessibility.switch")}
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
  const { t } = useTranslation()
  const liked = useSharedValue(isFavorite ? 1 : 0)

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (cookbook.image) {
      return { uri: cookbook.image }
    }
    return getCookbookImage(cookbook.id)
  }, [cookbook.id, cookbook.image])

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

  const handlePressFavorite = useCallback(() => {
    onPressFavorite()
    liked.value = withSpring(liked.value ? 0 : 1)
  }, [onPressFavorite, liked])

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityLabel: cookbook.title,
          accessibilityHint: t("demoPodcastListScreen:accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: cookbook.title,
          accessibilityActions: [
            {
              name: "longpress",
              label: t("demoPodcastListScreen:accessibility.favoriteAction"),
            },
          ],
          onAccessibilityAction: ({ nativeEvent }) => {
            if (nativeEvent.actionName === "longpress") {
              handlePressFavorite()
            }
          },
        },
      }),
    [cookbook, isFavorite, handlePressFavorite, t],
  )

  const handlePressCard = () => {
    router.push(`../cookbook/${cookbook.id}`)
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
    [isDark, themed, animatedLikeButtonStyles, animatedUnlikeButtonStyles],
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
      contentStyle={$themedMetadataText}
      {...accessibilityHintProps}
      RightComponent={<Image source={imageUri} style={$themedItemThumbnail} />}
      FooterComponent={
        <Button
          onPress={handlePressFavorite}
          onLongPress={handlePressFavorite}
          style={[$themedFavoriteButton, isFavorite && $themedUnFavoriteButton]}
          accessibilityLabel={
            isFavorite
              ? t("demoPodcastListScreen:accessibility.unfavoriteIcon")
              : t("demoPodcastListScreen:accessibility.favoriteIcon")
          }
          LeftAccessory={ButtonLeftAccessory}
        >
          <Text
            size="xxs"
            weight="medium"
            text={
              isFavorite
                ? t("demoPodcastListScreen:unfavoriteButton")
                : t("demoPodcastListScreen:favoriteButton")
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

const $listContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxxl + spacing.xxl,
}

const $heading: ViewStyle = {
  marginBottom: spacing.md,
  paddingTop: spacing.lg + spacing.xl,
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
