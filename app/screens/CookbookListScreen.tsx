import { observer } from "mobx-react-lite"
import React, { ComponentType, FC, useEffect, useMemo, useState } from "react"
import {
  AccessibilityProps,
  ActivityIndicator,
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
  AutoImage,
  Button,
  ButtonAccessoryProps,
  Card,
  EmptyState,
  Icon,
  ListItem,
  ListView,
  Screen,
  Text,
  Toggle,
} from "../components"
import { isRTL, translate } from "../i18n"
import { useStores } from "../models"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { colors, spacing } from "../theme"
import { delay } from "../utils/delay"
import { Cookbook } from "app/models/Cookbook"
import { CookbookStackParamList } from "app/navigators/CookbookNavigator"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { Drawer } from "react-native-drawer-layout"
import { Image } from "react-native"
import { DrawerIconButton } from "./DemoShowroomScreen/DrawerIconButton"

const logo = require("../../assets/images/logo.png")

type CookbookListScreenNavigationProp = NativeStackNavigationProp<
  CookbookStackParamList,
  "CookbookList"
>

const ICON_SIZE = 14

const rnrImage1 = require("../../assets/images/demo/rnr-image-1.png")
const rnrImage2 = require("../../assets/images/demo/rnr-image-2.png")
const rnrImage3 = require("../../assets/images/demo/rnr-image-3.png")
const rnrImages = [rnrImage1, rnrImage2, rnrImage3]

export const CookbookListScreen: FC<DemoTabScreenProps<"CookbookList">> = observer(
  function CookbookListScreen(_props) {
    const { cookbookStore } = useStores()
    const [open, setOpen] = useState(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const navigation = useNavigation<CookbookListScreenNavigationProp>()

    // initially, kick off a background refresh without the refreshing UI
    useEffect(() => {
      ;(async function load() {
        setIsLoading(true)
        await cookbookStore.fetchCookbooks()
        setIsLoading(false)
      })()
    }, [cookbookStore])

    // simulate a longer refresh, if the refresh is too fast for UX
    async function manualRefresh() {
      setRefreshing(true)
      await Promise.all([cookbookStore.fetchCookbooks(), delay(750)])
      setRefreshing(false)
    }

    const toggleDrawer = () => {
      setOpen(!open)
    }

    const $drawerInsets = useSafeAreaInsetsStyle(["top"])

    return (
      <Drawer
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        drawerType="back"
        drawerPosition={"right"}
        renderDrawerContent={() => (
          <View style={[$drawer, $drawerInsets]}>
            <View style={$logoContainer}>
              <Image source={logo} style={$logoImage} />
            </View>
            <ListItem
              text={translate("cookbookListScreen.add")}
              textStyle={$right}
              rightIcon="caretRight"
            />
          </View>
        )}
      >
      <Screen
        preset="fixed"
        safeAreaEdges={["top"]}
        contentContainerStyle={$screenContentContainer}
      >
        <ListView<Cookbook>
          contentContainerStyle={$listContentContainer}
          data={cookbookStore.cookbooksForList.slice()}
          extraData={cookbookStore.favorites.length + cookbookStore.cookbooks.length}
          refreshing={refreshing}
          estimatedItemSize={177}
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
                    ? "cookbookListScreen.noFavoritesEmptyState.heading"
                    : undefined
                }
                contentTx={
                  cookbookStore.favoritesOnly
                    ? "cookbookListScreen.noFavoritesEmptyState.content"
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
            <View>
              <View style={$headerContainer}>
                <Text preset="heading" tx="cookbookListScreen.title" />
                <DrawerIconButton onPress={toggleDrawer} />
              </View>
              {(cookbookStore.favoritesOnly || cookbookStore.cookbooksForList.length > 0) && (
                <View style={$toggle}>
                  <Toggle
                    value={cookbookStore.favoritesOnly}
                    onValueChange={() =>
                      cookbookStore.setProp("favoritesOnly", !cookbookStore.favoritesOnly)
                    }
                    variant="switch"
                    labelTx="cookbookListScreen.onlyFavorites"
                    labelPosition="left"
                    labelStyle={$labelStyle}
                    accessibilityLabel={translate("cookbookListScreen.accessibility.switch")}
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
            />
          )}
        />
      </Screen>
      </Drawer>
    )
  },
)

const CookbookCard = observer(function CookbookCard({
  cookbook,
  isFavorite,
  onPressFavorite,
}: {
  cookbook: Cookbook
  onPressFavorite: () => void
  isFavorite: boolean
}) {
  const liked = useSharedValue(isFavorite ? 1 : 0)

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (cookbook.imagePath) {
      return { uri: `${cookbook.getImagePath}` }
    } else {
      return rnrImages[Math.floor(Math.random() * rnrImages.length)]
    }
  }, [])

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
          accessibilityHint: translate("cookbookListScreen.accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: cookbook.title,
          accessibilityActions: [
            {
              name: "longpress",
              label: translate("cookbookListScreen.accessibility.favoriteAction"),
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

  const navigation = useNavigation<CookbookListScreenNavigationProp>()

  const handlePressCard = () => {
    navigation.navigate("RecipeList", { cookbook: cookbook })
  }

  const ButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function ButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[$iconContainer, StyleSheet.absoluteFill, animatedLikeButtonStyles]}
            >
              <Icon
                icon="heart"
                size={ICON_SIZE}
                color={colors.palette.neutral800} // dark grey
              />
            </Animated.View>
            <Animated.View style={[$iconContainer, animatedUnlikeButtonStyles]}>
              <Icon
                icon="heart"
                size={ICON_SIZE}
                color={colors.palette.primary400} // pink
              />
            </Animated.View>
          </View>
        )
      },
    [],
  )

  const MemberButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function MemberButtonLeftAccessory() {
        return (
              <Icon
                icon="community"
                size={ICON_SIZE}
                color={colors.palette.neutral800} // black
              />
        )
      },
    [],
  )

  return (
    <Card
      style={$item}
      verticalAlignment="force-footer-bottom"
      onPress={handlePressCard}
      onLongPress={handlePressFavorite}
      HeadingComponent={
        <View style={$metadata}>
          <Text
            style={$metadataText}
            size="xxs"
            accessibilityLabel={''}
          >
            {''}
          </Text>
          <Text
            style={$metadataText}
            size="xxs"
            accessibilityLabel={''}
          >
            {''}
          </Text>
        </View>
      }
      content={`${cookbook.parsedTitleAndSubtitle.title}`}
      {...accessibilityHintProps}
      RightComponent={<AutoImage source={imageUri} style={$itemThumbnail} />}
      FooterComponent={
        <View style={$buttonRow}>
          <Button
            onPress={handlePressFavorite}
            onLongPress={handlePressFavorite}
            style={[$favoriteButton, isFavorite && $unFavoriteButton]}
            accessibilityLabel={
              isFavorite
                ? translate("cookbookListScreen.accessibility.unfavoriteIcon")
                : translate("cookbookListScreen.accessibility.favoriteIcon")
            }
            LeftAccessory={ButtonLeftAccessory}
          >
            <Text
              size="xxs"
              accessibilityLabel={"accessibilityLabel"}
              weight="medium"
              text={
                isFavorite
                  ? translate("cookbookListScreen.unfavoriteButton")
                  : translate("cookbookListScreen.favoriteButton")
              }
            />
          </Button>
          <Button
            style={$favoriteButton}
            LeftAccessory={MemberButtonLeftAccessory}
          >
            <Text
              size="xxs"
              weight="medium"
              text={"  " + cookbook.membersCount.toString()}
            />
          </Button>
        </View>
      }
    />
  )
})

// #region Styles
const $screenContentContainer: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ContentStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.lg,
}

const $item: ViewStyle = {
  padding: spacing.md,
  marginTop: spacing.md,
  minHeight: 120,
}

const $itemThumbnail: ImageStyle = {
  marginTop: spacing.sm,
  height: 90,
  width: 90,
  borderRadius: 5,
  alignSelf: "flex-start",
}

const $toggle: ViewStyle = {
  marginTop: spacing.md,
}

const $labelStyle: TextStyle = {
  textAlign: "left",
}

const $iconContainer: ViewStyle = {
  height: ICON_SIZE,
  width: ICON_SIZE,
  flexDirection: "row",
  marginEnd: spacing.sm,
}

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  gap: 4
}

const $metadata: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.xs,
  flexDirection: "row",
}

const $metadataText: TextStyle = {
  color: colors.textDim,
  marginEnd: spacing.md,
  marginBottom: spacing.xs,
}

const $favoriteButton: ViewStyle = {
  borderRadius: 17,
  marginTop: spacing.md,
  justifyContent: "flex-start",
  backgroundColor: colors.palette.neutral300,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
}

const $unFavoriteButton: ViewStyle = {
  borderColor: colors.palette.primary100,
  backgroundColor: colors.palette.primary100,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $right: TextStyle = {
  textAlign: "right",
}

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-end",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}
// #endregion
