import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo, useState } from "react"
import { ImageStyle, TextStyle, ViewStyle, View, ActivityIndicator, ImageSourcePropType, Platform, Image, StyleSheet, Switch, AccessibilityProps } from "react-native"
import { Screen, Text, Button, ListItem, Card, ButtonAccessoryProps, Icon, ListView } from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { delay } from "src/utils/delay"
import { isRTL, translate } from "src/i18n"
import { EmptyState } from "src/components/EmptyState"
import { Invitation } from "src/models"
import { Extrapolate, interpolate, useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { ContentStyle } from "@shopify/flash-list"
import { router } from "expo-router"

const rnrImage1 = require("assets/images/demo/rnr-image-1.png")
const rnrImage2 = require("assets/images/demo/rnr-image-2.png")
const rnrImage3 = require("assets/images/demo/rnr-image-3.png")
const rnrImages = [rnrImage1, rnrImage2, rnrImage3]

const ICON_SIZE = 14

export default observer(function Invitations() {
  const { invitationStore } = useStores()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await invitationStore.fetch()
      setIsLoading(false)
    })()
  }, [invitationStore])

  useEffect(() => {
    ;(async function reload() {
      await invitationStore.fetch()
    })()
  }, [invitationStore.fetch])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([invitationStore.fetch(), delay(750)])
    setRefreshing(false)
  }

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={["top"]}
      style={$screenContentContainer}
      contentContainerStyle={$screenContentContainer}
    >
      <ListView<Invitation>
        contentContainerStyle={$listContentContainer}
        data={invitationStore.invitations.items.slice()}
        extraData={invitationStore.invitations.items.length}
        refreshing={refreshing}
        estimatedItemSize={382}
        onRefresh={manualRefresh}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              headingTx={
                invitationStore.invitations.items.length === 0
                  ? "demoPodcastListScreen:noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                invitationStore.invitations.items.length === 0
                  ? "demoPodcastListScreen:noFavoritesEmptyState.content"
                  : undefined
              }
              button={invitationStore.invitations.items.length === 0 ? "" : undefined}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View style={$heading}>
            <Text preset="heading" tx="pendingInvitationScreen:title" />
          </View>
        }
        renderItem={({ item }) => (
          <InvitationCard
            invitation={item}
            isFavorite={false}
            onPressFavorite={() => {}}
            isDark={false}
          />
        )}
      />
    </Screen>
  )
})

const InvitationCard = observer(function CookbookCard({
  invitation,
  isFavorite,
  onPressFavorite,
  isDark,
}: {
  invitation: Invitation
  onPressFavorite: () => void
  isFavorite: boolean
  isDark: boolean
}) {
  const acceptPressed = useSharedValue(0)
  const rejectPressed = useSharedValue(0)

  const handleAccept = () => {
    // TODO: Implement accept invitation
    console.log("Accept invitation:", invitation.id)
    acceptPressed.value = withSpring(1)
  }

  const handleReject = () => {
    // TODO: Implement reject invitation
    console.log("Reject invitation:", invitation.id)
    rejectPressed.value = withSpring(1)
  }

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (invitation.cookbookImage) {
      return { uri: `${invitation.getImage}` }
    } else {
      return rnrImages[Math.floor(Math.random() * rnrImages.length)]
    }
  }, [invitation.cookbookImage])

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityLabel: invitation.cookbookTitle,
          accessibilityHint: translate("demoPodcastListScreen:accessibility.cardHint", {
            action: isFavorite ? "unfavorite" : "favorite",
          }),
        },
        android: {
          accessibilityLabel: invitation.cookbookTitle,
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
    [invitation, isFavorite],
  )

  const handlePressFavorite = () => {
    onPressFavorite()
  }

  const handlePressCard = () => {
    //router.push(`/(app)/cookbook/${cookbook.id}`)
  }

  // Grey checkmark
  const animatedAcceptButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(acceptPressed.value, [0, 1], [1, 0], Extrapolate.EXTEND),
        },
      ],
      opacity: interpolate(acceptPressed.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    }
  })

  // Green checkmark
  const animatedAcceptPressedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: acceptPressed.value,
        },
      ],
      opacity: acceptPressed.value,
    }
  })

  // Grey X
  const animatedRejectButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(rejectPressed.value, [0, 1], [1, 0], Extrapolate.EXTEND),
        },
      ],
      opacity: interpolate(rejectPressed.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    }
  })

  // Red X
  const animatedRejectPressedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: rejectPressed.value,
        },
      ],
      opacity: rejectPressed.value,
    }
  })

  const AcceptButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function AcceptButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[$iconContainer, StyleSheet.absoluteFill, animatedAcceptButtonStyles]}
            >
              <Icon
                icon="check"
                size={ICON_SIZE}
                color={isDark ? colors.palette.neutral400 : colors.palette.neutral800}
              />
            </Animated.View>
            <Animated.View style={[$iconContainer, animatedAcceptPressedStyles]}>
              <Icon icon="check" size={ICON_SIZE} color={colors.palette.primary400} />
            </Animated.View>
          </View>
        )
      },
    [isDark, animatedAcceptButtonStyles, animatedAcceptPressedStyles],
  )

  const RejectButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function RejectButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[$iconContainer, StyleSheet.absoluteFill, animatedRejectButtonStyles]}
            >
              <Icon
                icon="x"
                size={ICON_SIZE}
                color={isDark ? colors.palette.neutral400 : colors.palette.neutral800}
              />
            </Animated.View>
            <Animated.View style={[$iconContainer, animatedRejectPressedStyles]}>
              <Icon icon="x" size={ICON_SIZE} color={colors.palette.angry500} />
            </Animated.View>
          </View>
        )
      },
    [isDark, animatedRejectButtonStyles, animatedRejectPressedStyles],
  )

  return (
    <Card
      style={[
        $item,
        isDark && $itemDark,
        isDark && {
          shadowOpacity: 0,
          elevation: 0,
        },
      ]}
      verticalAlignment="force-footer-bottom"
      onPress={handlePressCard}
      preset={isDark ? "reversed" : "default"}
      HeadingComponent={
        <View style={$metadata}>
          <Text
            style={[$metadataText, isDark && $metadataTextDark]}
            size="xxs"
            accessibilityLabel={invitation.getSenderInfo}
          >
            {invitation.getSenderInfo}
          </Text>
          <Text
            style={[$metadataText, isDark && $metadataTextDark]}
            size="xxs"
            accessibilityLabel={invitation.getTimeAgo}
          >
            {invitation.getTimeAgo}
          </Text>
        </View>
      }
      content={invitation.getParsedInvitationMessage}
      {...accessibilityHintProps}
      RightComponent={<Image source={imageUri} style={$itemThumbnail} />}
      FooterComponent={
        <View style={$buttonContainer}>
          <Button
            onPress={handleAccept}
            style={[
              $actionButton,
              $acceptButton,
              isDark && $acceptButtonDark,
            ]}
            accessibilityLabel={translate("pendingInvitationScreen:accept")}
            LeftAccessory={AcceptButtonLeftAccessory}
          >
            <Text
              size="xxs"
              weight="medium"
              text={translate("pendingInvitationScreen:accept")}
              style={[isDark && $actionButtonTextDark]}
            />
          </Button>
          <Button
            onPress={handleReject}
            style={[
              $actionButton,
              $rejectButton,
              isDark && $rejectButtonDark,
            ]}
            accessibilityLabel={translate("pendingInvitationScreen:reject")}
            LeftAccessory={RejectButtonLeftAccessory}
          >
            <Text
              size="xxs"
              weight="medium"
              text={translate("pendingInvitationScreen:reject")}
              style={[isDark && $actionButtonTextDark]}
            />
          </Button>
        </View>
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

const $item: ViewStyle = {
  padding: spacing.md,
  marginTop: spacing.md,
  minHeight: 120,
  backgroundColor: colors.palette.neutral100,
}

const $itemDark: ViewStyle = {
  backgroundColor: colors.palette.neutral800,
}

const $itemThumbnail: ImageStyle = {
  marginTop: spacing.sm,
  height: 90,
  width: 90,
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

const $metadata: TextStyle = {
  color: colors.textDim,
  marginTop: spacing.xs,
  flexDirection: "column",
}

const $metadataText: TextStyle = {
  color: colors.textDim,
  marginBottom: spacing.xs,
}

const $metadataTextDark: TextStyle = {
  color: colors.palette.neutral400,
}

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.md,
  gap: spacing.sm,
}

const $actionButton: ViewStyle = {
  flex: 1,
  borderRadius: 17,
  justifyContent: "center",
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
}

const $acceptButton: ViewStyle = {
  backgroundColor: colors.palette.primary200,
  borderColor: colors.palette.primary300,
}

const $acceptButtonDark: ViewStyle = {
  backgroundColor: colors.palette.secondary300,
  borderColor: colors.palette.secondary300,
}

const $rejectButton: ViewStyle = {
  backgroundColor: colors.palette.primary200,
  borderColor: colors.palette.primary300,
}

const $rejectButtonDark: ViewStyle = {
  backgroundColor: colors.palette.primary200,
  borderColor: colors.palette.primary200,
}

const $actionButtonTextDark: TextStyle = {
  color: colors.palette.neutral100,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}
