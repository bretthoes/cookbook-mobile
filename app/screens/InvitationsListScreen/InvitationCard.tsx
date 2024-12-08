import { ButtonAccessoryProps, Icon, Card, AutoImage, Button } from "app/components";
import { translate } from "app/i18n";
import { Invitation } from "app/models";
import { colors, spacing } from "app/theme";
import { observer } from "mobx-react-lite";
import React, { useMemo, ComponentType } from "react";
import { ImageSourcePropType, Platform, AccessibilityProps, View, TextStyle, ViewStyle, ImageStyle } from "react-native";
import { StyleSheet } from "react-native"
import { Text } from "../../components"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

export const ICON_SIZE = 14

const rnrImage1 = require("../../../assets/images/demo/rnr-image-1.png")
const rnrImage2 = require("../../../assets/images/demo/rnr-image-2.png")
const rnrImage3 = require("../../../assets/images/demo/rnr-image-3.png")
export const rnrImages = [rnrImage1, rnrImage2, rnrImage3]

export const InvitationCard = observer(function InvitationCard({
  invitation, onPressAccept, onPressReject,
}: {
  invitation: Invitation;
  onPressAccept: () => void
  onPressReject: () => void
}) {


  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (invitation.cookbookImage) {
      return { uri: `${invitation.getImage}` };
    } else {
      return rnrImages[Math.floor(Math.random() * rnrImages.length)];
    }
  }, [])

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () => Platform.select<AccessibilityProps>({
      ios: {
        accessibilityLabel: invitation.cookbookTitle,
        accessibilityHint: translate("cookbookListScreen.accessibility.cardHint", {
          action: "favorite",
        }),
      },
      android: {
        accessibilityLabel: invitation.cookbookTitle,
        accessibilityActions: [
          {
            name: "longpress",
            label: translate("cookbookListScreen.accessibility.favoriteAction"),
          },
        ],
        onAccessibilityAction: ({ nativeEvent }) => {
          if (nativeEvent.actionName === "longpress") {
            handlePressAccept
          }
        },
      },
    }),
    [invitation]
  )

  const handlePressAccept = () => {
    onPressAccept()
  }

  const handlePressReject = () => {
    onPressReject()
  }

  const AcceptButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () => function AcceptButtonLeftAccessory() {
      return (
        <View>
          <Animated.View
            style={[$iconContainer, StyleSheet.absoluteFill]}
          >
            <Icon
              icon="check"
              size={ICON_SIZE}
              color={colors.palette.neutral800}
            />
          </Animated.View>
          <Animated.View style={[$iconContainer]}>
            <Icon
              icon="check"
              size={ICON_SIZE}
              color={colors.palette.primary400}
            />
          </Animated.View>
        </View>
      )
    },
    []
  )

  const RejectButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () => function RejectButtonLeftAccessory() {
      return (
        <View>
          <Animated.View
            style={[$iconContainer, StyleSheet.absoluteFill]}
          >
            <Icon
              icon="x"
              size={ICON_SIZE}
              color={colors.palette.neutral800} // dark grey
            />
          </Animated.View>
          <Animated.View style={[$iconContainer]}>
            <Icon
              icon="x"
              size={ICON_SIZE}
              color={colors.palette.primary400} // pink
            />
          </Animated.View>
        </View>
      )
    },
    []
  )

  return (
    <Card
      style={$item}
      verticalAlignment="force-footer-bottom"
      HeadingComponent={<View style={$metadata}>
        <Text style={$metadataText} size="xxs" accessibilityLabel={""}>
          {""}
        </Text>
        <Text style={$metadataText} size="xxs" accessibilityLabel={""}>
          {""}
        </Text>
      </View>}
      content={`${invitation.getParsedInvitationMessage}`}
      {...accessibilityHintProps}
      RightComponent={<AutoImage source={imageUri} style={$itemThumbnail} />}
      FooterComponent={<View style={$buttonRow}>
        <Button
          onPress={handlePressAccept}
          onLongPress={handlePressAccept}
          style={$acceptButton}
          LeftAccessory={AcceptButtonLeftAccessory}
        >
          <Text
            size="xs"
            accessibilityLabel={"accessibilityLabel"}
            weight="medium"
            text="Accept" />
        </Button>
        <Button
          style={$rejectButton}
          LeftAccessory={RejectButtonLeftAccessory}
          onPress={handlePressReject}
          onLongPress={handlePressReject}>
          <Text size="xs" weight="medium" text="Reject" />
        </Button>
      </View>} />
  )
})

// #region Styles
const $metadataText: TextStyle = {
  color: colors.textDim,
  marginEnd: spacing.md,
  marginBottom: spacing.xs,
}

const $acceptButton: ViewStyle = {
  borderRadius: 17,
  marginTop: spacing.md,
  justifyContent: "flex-start",
  backgroundColor: colors.palette.secondary100,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
}

const $rejectButton: ViewStyle = {
  borderRadius: 17,
  marginTop: spacing.md,
  justifyContent: "flex-start",
  backgroundColor: colors.palette.angry100,
  borderColor: colors.palette.neutral300,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.xxxs,
  paddingBottom: 0,
  minHeight: 32,
  alignSelf: "flex-start",
}

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  gap: 4,
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
  flexDirection: "row",
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
// #endregion
