import { observer } from "mobx-react-lite"
import React, { ComponentType, useEffect, useMemo, useState } from "react"
import {
  ImageStyle,
  TextStyle,
  ViewStyle,
  View,
  ActivityIndicator,
  ImageSourcePropType,
  Platform,
  Image,
  StyleSheet,
  Switch,
  AccessibilityProps,
} from "react-native"
import {
  Screen,
  Text,
  Button,
  ListItem,
  Card,
  ButtonAccessoryProps,
  Icon,
  ListView,
} from "src/components"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { delay } from "src/utils/delay"
import { isRTL, translate } from "src/i18n"
import { EmptyState } from "src/components/EmptyState"
import { Invitation } from "src/models"
import Animated, {
  Extrapolate,
  interpolate,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from "react-native-reanimated"

import { ContentStyle } from "@shopify/flash-list"
import { router } from "expo-router"
import { useHeader } from "src/utils/useHeader"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"
import { getCookbookImage } from "src/utils/cookbookImages"

const ICON_SIZE = 14

export default observer(function Invitations() {
  const { invitationStore } = useStores()

  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useHeader({
    leftIcon: "back",
    title: "Invitations",
    onLeftPress: () => router.back(),
  })

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
    <Screen preset="scroll" style={$root}>
      <Text
        text="Manage your cookbook invitations."
        style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
      />

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

const InvitationCard = observer(function InvitationCard({
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
  const { invitationStore } = useStores()
  const { themed } = useAppTheme()
  const acceptPressed = useSharedValue(0)
  const rejectPressed = useSharedValue(0)
  const cardOpacity = useSharedValue(1)

  const handleRespond = (accepted: boolean) => {
    if (accepted) {
      acceptPressed.value = withSpring(1)
    } else {
      rejectPressed.value = withSpring(1)
    }
    cardOpacity.value = withSpring(0, { duration: 1000 })
    setTimeout(() => {
      invitationStore.respond(invitation.id, accepted)
    }, 1000)
  }

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
    }
  })

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (invitation.cookbookImage) {
      return { uri: invitation.cookbookImage }
    }
    return getCookbookImage(invitation.id)
  }, [invitation.cookbookImage, invitation.id])

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
              style={[themed($iconContainer), StyleSheet.absoluteFill, animatedAcceptButtonStyles]}
            >
              <Icon icon="check" size={ICON_SIZE} color={isDark ? colors.textDim : colors.text} />
            </Animated.View>
            <Animated.View style={[themed($iconContainer), animatedAcceptPressedStyles]}>
              <Icon icon="check" size={ICON_SIZE} color={colors.tint} />
            </Animated.View>
          </View>
        )
      },
    [isDark, animatedAcceptButtonStyles, animatedAcceptPressedStyles, themed],
  )

  const RejectButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function RejectButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[themed($iconContainer), StyleSheet.absoluteFill, animatedRejectButtonStyles]}
            >
              <Icon icon="x" size={ICON_SIZE} color={isDark ? colors.textDim : colors.text} />
            </Animated.View>
            <Animated.View style={[themed($iconContainer), animatedRejectPressedStyles]}>
              <Icon icon="x" size={ICON_SIZE} color={colors.error} />
            </Animated.View>
          </View>
        )
      },
    [isDark, animatedRejectButtonStyles, animatedRejectPressedStyles, themed],
  )

  const $themedItem = useMemo(() => themed($item), [themed])
  const $themedItemThumbnail = useMemo(() => themed($itemThumbnail), [themed])
  const $themedMetadata = useMemo(() => themed($metadata), [themed])
  const $themedMetadataText = useMemo(() => themed($metadataText), [themed])
  const $themedActionButton = useMemo(() => themed($actionButton), [themed])
  const $themedAcceptButton = useMemo(() => themed($acceptButton), [themed])
  const $themedRejectButton = useMemo(() => themed($rejectButton), [themed])

  return (
    <Animated.View style={animatedCardStyle}>
      <Card
        style={[
          $themedItem,
          isDark && {
            shadowOpacity: 0,
            elevation: 0,
          },
        ]}
        verticalAlignment="force-footer-bottom"
        HeadingComponent={
          <View style={$themedMetadata}>
            <Text
              style={$themedMetadataText}
              size="xxs"
              accessibilityLabel={invitation.getSenderInfo}
            >
              {invitation.getSenderInfo}
            </Text>
            <Text style={$themedMetadataText} size="xxs" accessibilityLabel={invitation.getTimeAgo}>
              {invitation.getTimeAgo}
            </Text>
          </View>
        }
        content={invitation.getParsedInvitationMessage}
        {...accessibilityHintProps}
        RightComponent={<Image source={imageUri} style={$themedItemThumbnail} />}
        FooterComponent={
          <View style={$buttonContainer}>
            <Button
              onPress={() => handleRespond(true)}
              style={[$themedActionButton, $themedAcceptButton]}
              accessibilityLabel={translate("pendingInvitationScreen:accept")}
              LeftAccessory={AcceptButtonLeftAccessory}
            >
              <Text size="xxs" weight="medium" text={translate("pendingInvitationScreen:accept")} />
            </Button>
            <Button
              onPress={() => handleRespond(false)}
              style={[$themedActionButton, $themedRejectButton]}
              accessibilityLabel={translate("pendingInvitationScreen:reject")}
              LeftAccessory={RejectButtonLeftAccessory}
            >
              <Text size="xxs" weight="medium" text={translate("pendingInvitationScreen:reject")} />
            </Button>
          </View>
        }
      />
    </Animated.View>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ContentStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $item: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  marginTop: theme.spacing.md,
  minHeight: 120,
  backgroundColor: theme.colors.background,
})

const $itemThumbnail: ThemedStyle<ImageStyle> = (theme) => ({
  marginTop: theme.spacing.sm,
  height: 90,
  width: 90,
  alignSelf: "flex-start",
})

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  height: ICON_SIZE,
  width: ICON_SIZE,
  flexDirection: "row",
  marginEnd: theme.spacing.sm,
})

const $metadata: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.xs,
  flexDirection: "column",
})

const $metadataText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginBottom: theme.spacing.xs,
})

const $buttonContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.md,
  gap: spacing.sm,
}

const $actionButton: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  borderRadius: 17,
  justifyContent: "center",
  paddingHorizontal: theme.spacing.md,
  paddingTop: theme.spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
})

const $acceptButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderColor: theme.colors.tint,
})

const $rejectButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.errorBackground,
  borderColor: theme.colors.error,
})

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}
