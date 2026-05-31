import { Button, ButtonAccessoryProps } from "@/components/Button"
import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useManualRefresh } from "@/hooks/useManualRefresh"
import { isRTL, translate } from "@/i18n"
import { useInvitationStore } from "@/stores/invitationStore"
import type { Invitation } from "@/types/invitation"
import {
  getInvitationSenderInfo,
  getInvitationTimeAgo,
  getParsedInvitationMessage,
} from "@/utils/invitationFormat"
import { colors, spacing } from "@/theme"
import React, { ComponentType, useCallback, useEffect, useMemo, useState } from "react"
import {
  AccessibilityProps,
  ActivityIndicator,
  FlatList,
  Image,
  ImageSourcePropType,
  ImageStyle,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { getCookbookImage } from "@/utils/cookbookImages"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"

const ICON_SIZE = 14

export default function Invitations() {
  const invitationItems = useInvitationStore((s) => s.invitations.items)
  const fetchInvitations = useInvitationStore((s) => s.fetch)

  const [isLoading, setIsLoading] = useState(false)

  const { refreshing, onRefresh } = useManualRefresh(
    useCallback(() => fetchInvitations(), [fetchInvitations]),
  )

  useHeader({
    leftIcon: "back",
    titleTx: "invitationScreen:title",
    onLeftPress: () => router.replace("/(logged-in)/(tabs)/cookbooks"),
  })

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await fetchInvitations()
      setIsLoading(false)
    })()
  }, [fetchInvitations])

  return (
    <Screen preset="fixed" style={$root}>
      <FlatList<Invitation>
        ListHeaderComponent={
          <Text
            tx="invitationScreen:subtitle"
            style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}
          />
        }
        contentContainerStyle={$listContentContainer}
        data={invitationItems.slice()}
        keyExtractor={(item) => item.id.toString()}
        extraData={invitationItems.length}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              headingTx={
                invitationItems.length === 0
                  ? "cookbooksScreen:cookbookListScreen.noFavoritesEmptyState.heading"
                  : undefined
              }
              contentTx={
                invitationItems.length === 0 ? "pendingInvitationScreen:emptyState" : undefined
              }
              button={invitationItems.length === 0 ? "" : undefined}
              buttonOnPress={onRefresh}
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
}

function InvitationCard({
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
  const respond = useInvitationStore((s) => s.respond)
  const { themed } = useAppTheme()
  const acceptPressed = useSharedValue(0)
  const rejectPressed = useSharedValue(0)
  const cardOpacity = useSharedValue(1)
  const isRespondingRef = React.useRef(false)

  const handleRespond = (accepted: boolean) => {
    if (isRespondingRef.current) return
    isRespondingRef.current = true

    if (accepted) acceptPressed.value = withSpring(1)
    else rejectPressed.value = withSpring(1)
    cardOpacity.value = withSpring(0)

    setTimeout(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      respond(invitation.id, accepted)
    }, 500)
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

  const handlePressFavorite = useCallback(() => {
    onPressFavorite()
  }, [onPressFavorite])

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () =>
      Platform.select<AccessibilityProps>({
        ios: {
          accessibilityLabel: invitation.cookbookTitle,
          accessibilityHint: translate(
            "cookbooksScreen:cookbookListScreen.accessibility.cardHint",
            {
              action: isFavorite ? "unfavorite" : "favorite",
            },
          ),
        },
        android: {
          accessibilityLabel: invitation.cookbookTitle,
          accessibilityActions: [
            {
              name: "longpress",
              label: translate("cookbooksScreen:cookbookListScreen.accessibility.favoriteAction"),
            },
          ],
          onAccessibilityAction: ({ nativeEvent }) => {
            if (nativeEvent.actionName === "longpress") {
              handlePressFavorite()
            }
          },
        },
      }),
    [invitation, isFavorite, handlePressFavorite],
  )

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
              accessibilityLabel={getInvitationSenderInfo(invitation)}
            >
              {getInvitationSenderInfo(invitation)}
            </Text>
            <Text
              style={$themedMetadataText}
              size="xxs"
              accessibilityLabel={getInvitationTimeAgo(invitation)}
            >
              {getInvitationTimeAgo(invitation)}
            </Text>
          </View>
        }
        content={getParsedInvitationMessage(invitation)}
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
              <Text size="xxs" weight="medium" tx="pendingInvitationScreen:accept" />
            </Button>
            <Button
              onPress={() => handleRespond(false)}
              style={[$themedActionButton, $themedRejectButton]}
              accessibilityLabel={translate("pendingInvitationScreen:reject")}
              LeftAccessory={RejectButtonLeftAccessory}
            >
              <Text size="xxs" weight="medium" tx="pendingInvitationScreen:reject" />
            </Button>
          </View>
        }
      />
    </Animated.View>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
}

const $item: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  marginTop: theme.spacing.md,
  minHeight: 120,
  backgroundColor: theme.colors.backgroundDim,
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

const $metadata: ThemedStyle<ViewStyle> = (theme) => ({
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
