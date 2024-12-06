import { ButtonAccessoryProps, Icon, Card, AutoImage, Button } from "app/components";
import { translate } from "app/i18n";
import { useStores } from "app/models";
import { Cookbook } from "app/models/Cookbook";
import { DemoTabScreenProps } from "app/navigators/DemoNavigator";
import { colors } from "app/theme";
import { observer } from "mobx-react-lite";
import React, { useMemo, ComponentType } from "react";
import { ImageSourcePropType, Platform, AccessibilityProps, View } from "react-native";
import { useNavigation } from "@react-navigation/native"
import { rnrImages, $iconContainer, ICON_SIZE, $item, $metadata, $metadataText, $itemThumbnail, $buttonRow, $favoriteButton, $unFavoriteButton } from "./CookbookListScreen";
import { StyleSheet } from "react-native"
import { Text } from "../../components"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"

export const CookbookCard = observer(function CookbookCard({
  cookbook, isFavorite, onPressFavorite,
}: {
  cookbook: Cookbook;
  onPressFavorite: () => void;
  isFavorite: boolean;
}) {

  const { cookbookStore } = useStores();
  const liked = useSharedValue(isFavorite ? 1 : 0);

  const imageUri = useMemo<ImageSourcePropType>(() => {
    if (cookbook.image) {
      return { uri: `${cookbook.getImage}` };
    } else {
      return rnrImages[Math.floor(Math.random() * rnrImages.length)];
    }
  }, []);

  // Grey heart
  const animatedLikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.EXTEND),
        },
      ],
      opacity: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
    };
  });

  // Pink heart
  const animatedUnlikeButtonStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: liked.value,
        },
      ],
      opacity: liked.value,
    };
  });

  /**
   * Android has a "longpress" accessibility action. iOS does not, so we just have to use a hint.
   * @see https://reactnative.dev/docs/accessibility#accessibilityactions
   */
  const accessibilityHintProps = useMemo(
    () => Platform.select<AccessibilityProps>({
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
            handlePressFavorite();
          }
        },
      },
    }),
    [cookbook, isFavorite]
  );

  const handlePressFavorite = () => {
    onPressFavorite();
    liked.value = withSpring(liked.value ? 0 : 1);
  };

  const handlePressMembers = () => {
    cookbookStore.setCurrentCookbook(cookbook);
    navigation.navigate("MembersList");
  };

  const navigation = useNavigation<DemoTabScreenProps<"CookbookList">["navigation"]>();
  const handlePressCard = () => {
    cookbookStore.setCurrentCookbook(cookbook);
    navigation.navigate("CookbookDetails");
  };

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
  );

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
  );

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
      content={`${cookbook.parsedTitleAndSubtitle.title}`}
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
          <Text size="xxs" weight="medium" text={"  " + cookbook.membersCount.toString()} />
        </Button>
      </View>} />
  );
});