import { Button, ButtonAccessoryProps } from "@/components/Button"
import { Text } from "@/components/Text"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme"
import { useTranslation } from "react-i18next"
import { ComponentType, useCallback, useMemo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated"
import { Icon } from "./Icon"

const ICON_SIZE = 14

export interface FavoriteAnimatedButtonProps {
  isFavorite: boolean
  isDark?: boolean
  onPress: () => void
  favoriteTx?: string
  unfavoriteTx?: string
  favoriteAccessibilityTx?: string
  unfavoriteAccessibilityTx?: string
}

/**
 * Animated heart favorite toggle used on list cards (cookbooks, invitations).
 */
export function FavoriteAnimatedButton(props: FavoriteAnimatedButtonProps) {
  const {
    isFavorite,
    isDark = false,
    onPress,
    favoriteTx = "cookbooksScreen:favoriteButton",
    unfavoriteTx = "cookbooksScreen:unfavoriteButton",
    favoriteAccessibilityTx = "cookbooksScreen:cookbookListScreen.accessibility.favoriteIcon",
    unfavoriteAccessibilityTx = "cookbooksScreen:cookbookListScreen.accessibility.unfavoriteIcon",
  } = props

  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()
  const liked = useSharedValue(isFavorite ? 1 : 0)

  const animatedLikeButtonStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.EXTEND),
      },
    ],
    opacity: interpolate(liked.value, [0, 1], [1, 0], Extrapolate.CLAMP),
  }))

  const animatedUnlikeButtonStyles = useAnimatedStyle(() => ({
    transform: [{ scale: liked.value }],
    opacity: liked.value,
  }))

  const handlePress = useCallback(() => {
    onPress()
    liked.value = withSpring(liked.value ? 0 : 1)
  }, [onPress, liked])

  const ButtonLeftAccessory: ComponentType<ButtonAccessoryProps> = useMemo(
    () =>
      function ButtonLeftAccessory() {
        return (
          <View>
            <Animated.View
              style={[themed($iconContainer), StyleSheet.absoluteFill, animatedLikeButtonStyles]}
            >
              <Icon icon="heart" size={ICON_SIZE} color={isDark ? theme.colors.border : theme.colors.text} />
            </Animated.View>
            <Animated.View style={[themed($iconContainer), animatedUnlikeButtonStyles]}>
              <Icon icon="heart" size={ICON_SIZE} color={theme.colors.palette.primary400} />
            </Animated.View>
          </View>
        )
      },
    [isDark, theme.colors, themed, animatedLikeButtonStyles, animatedUnlikeButtonStyles],
  )

  const $themedFavoriteButton = themed($favoriteButton)
  const $themedUnFavoriteButton = themed($unFavoriteButton)

  return (
    <Button
      onPress={handlePress}
      onLongPress={handlePress}
      style={[$themedFavoriteButton, isFavorite && $themedUnFavoriteButton]}
      accessibilityLabel={
        isFavorite ? t(unfavoriteAccessibilityTx) : t(favoriteAccessibilityTx)
      }
      LeftAccessory={ButtonLeftAccessory}
    >
      <Text size="xxs" weight="medium" text={isFavorite ? t(unfavoriteTx) : t(favoriteTx)} />
    </Button>
  )
}

const $iconContainer: ThemedStyle<ViewStyle> = (theme) => ({
  height: ICON_SIZE,
  width: ICON_SIZE,
  flexDirection: "row",
  marginEnd: theme.spacing.sm,
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
