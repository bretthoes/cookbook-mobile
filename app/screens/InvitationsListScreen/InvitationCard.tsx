import { ButtonAccessoryProps, Icon, Card, AutoImage, Button } from "app/components";
import { translate } from "app/i18n";
import { Invitation, useStores } from "app/models";
import { DemoTabScreenProps } from "app/navigators/DemoNavigator";
import { colors, spacing } from "app/theme";
import { observer } from "mobx-react-lite";
import React, { useMemo, ComponentType } from "react";
import { ImageSourcePropType, Platform, AccessibilityProps, View, TextStyle, ViewStyle, ImageStyle } from "react-native";
import { useNavigation } from "@react-navigation/native"
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
  cookbook, isFavorite, onPressFavorite,
}: {
  cookbook: Invitation;
  onPressFavorite: () => void;
  isFavorite: boolean;
}) {

  const { invitationStore } = useStores();
  const liked = useSharedValue(isFavorite ? 1 : 0);

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (cookbook.cookbookImage) {
      return { uri: `${cookbook.cookbookImage}` };
    } else {
      return rnrImages[Math.floor(Math.random() * rnrImages.length)];
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
    () => Platform.select<AccessibilityProps>({
      ios: {
        accessibilityLabel: cookbook.cookbookTitle,
        accessibilityHint: translate("cookbookListScreen.accessibility.cardHint", {
          action: isFavorite ? "unfavorite" : "favorite",
        }),
      },
      android: {
        accessibilityLabel: cookbook.cookbookTitle,
        accessibilityActions: [
          {
            name: "longpress",
            label: translate("cookbookListScreen.accessibility.favoriteAction"),
          },
        ],
        onAccessibilityAction: ({ nativeEvent }) => {
          if (nativeEvent.actionName === "longpress") {
            handlePressFavorite();
          }
        },
      },
    }),
    [cookbook, isFavorite]
  )

  const handlePressFavorite = () => {
    onPressFavorite();
    liked.value = withSpring(liked.value ? 0 : 1);
  }

  const handlePressMembers = () => {
    //InvitationStore.set(cookbook);
    navigation.navigate("MembersList");
  }

  const navigation = useNavigation<DemoTabScreenProps<"CookbookList">["navigation"]>();
  const handlePressCard = () => {
    //InvitationStore.setCurrentCookbook(cookbook);
    navigation.navigate("CookbookDetails");
  }

  const ButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () => function ButtonLeftAccessory() {
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
      );
    },
    []
  )

  const MemberButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () => function MemberButtonLeftAccessory() {
      return (
        <Icon
          icon="community"
          size={ICON_SIZE}
          color={colors.palette.neutral800} // black
        />
      );
    },
    []
  )

  return (
    <Card
      style={$item}
      verticalAlignment="force-footer-bottom"
      onPress={handlePressCard}
      onLongPress={handlePressFavorite}
      HeadingComponent={<View style={$metadata}>
        <Text style={$metadataText} size="xxs" accessibilityLabel={""}>
          {""}
        </Text>
        <Text style={$metadataText} size="xxs" accessibilityLabel={""}>
          {""}
        </Text>
      </View>}
      content={`${cookbook.cookbookTitle}`}
      {...accessibilityHintProps}
      RightComponent={<AutoImage source={imageUri} style={$itemThumbnail} />}
      FooterComponent={<View style={$buttonRow}>
        <Button
          onPress={handlePressFavorite}
          onLongPress={handlePressFavorite}
          style={[$favoriteButton, isFavorite && $unFavoriteButton]}
          accessibilityLabel={isFavorite
            ? translate("cookbookListScreen.accessibility.unfavoriteIcon")
            : translate("cookbookListScreen.accessibility.favoriteIcon")}
          LeftAccessory={ButtonLeftAccessory}
        >
          <Text
            size="xxs"
            accessibilityLabel={"accessibilityLabel"}
            weight="medium"
            text={isFavorite
              ? translate("cookbookListScreen.unfavoriteButton")
              : translate("cookbookListScreen.favoriteButton")} />
        </Button>
        <Button style={$favoriteButton} LeftAccessory={MemberButtonLeftAccessory} onPress={handlePressMembers}>
          <Text size="xxs" weight="medium" text={"  " + cookbook.cookbookTitle} />
        </Button>
      </View>} />
  );
});

// #region Styles
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

const $buttonRow: ViewStyle = {
  flexDirection: "row",
  gap: 4,
}

const $unFavoriteButton: ViewStyle = {
  borderColor: colors.palette.primary100,
  backgroundColor: colors.palette.primary100,
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
