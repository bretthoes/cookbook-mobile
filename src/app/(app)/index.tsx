import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import React from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { Button, Text } from "src/components"
import { isRTL } from "src/i18n"
import { useStores } from "src/models/helpers/useStores"
import { colors, spacing } from "src/theme"
import { useHeader } from "src/utils/useHeader"
import { useSafeAreaInsetsStyle } from "src/utils/useSafeAreaInsetsStyle"
import { useAppTheme } from "src/utils/useAppTheme"
import type { ThemedStyle } from "src/theme"

const welcomeLogo = require("assets/images/logo.png")
const welcomeFace = require("assets/images/welcome-face.png")

export default observer(function WelcomeScreen() {
  const {
    authenticationStore: { logout, displayName },
  } = useStores()
  const { themed } = useAppTheme()

  function goNext() {
    router.replace("/cookbooks")
  }

  useHeader(
    {
      rightTx: "common:logOut",
      onRightPress: logout,
    },
    [logout],
  )

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  // Memoize themed styles
  const $themedContainer = React.useMemo(() => themed($container), [themed])
  const $themedTopContainer = React.useMemo(() => themed($topContainer), [themed])
  const $themedBottomContainer = React.useMemo(() => themed($bottomContainer), [themed])
  const $themedWelcomeHeading = React.useMemo(() => themed($welcomeHeading), [themed])

  return (
    <View style={$themedContainer}>
      <View style={$themedTopContainer}>
        <Image style={$welcomeLogo} source={welcomeLogo} resizeMode="contain" />
        <Text
          testID="welcome-heading"
          style={$themedWelcomeHeading}
          tx="welcomeScreen:readyForLaunch"
          preset="heading"
        />
        <Text text={`Welcome back, ${displayName}`} preset="subheading" />
        <Image style={$welcomeFace} source={welcomeFace} resizeMode="contain" />
      </View>

      <View style={[$themedBottomContainer, $bottomContainerInsets]}>
        <Text tx="welcomeScreen:postscript" size="md" />
        <Button
          testID="next-screen-button"
          preset="reversed"
          tx="welcomeScreen:letsGo"
          onPress={goNext}
        />
      </View>
    </View>
  )
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $topContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexShrink: 1,
  flexGrow: 1,
  flexBasis: "57%",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
  backgroundColor: theme.colors.background,
})

const $bottomContainer: ThemedStyle<ViewStyle> = (theme) => ({
  flexShrink: 1,
  flexGrow: 0,
  flexBasis: "43%",
  backgroundColor: theme.colors.backgroundDim,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingHorizontal: spacing.lg,
  justifyContent: "space-around",
})

const $welcomeLogo: ImageStyle = {
  height: 88,
  width: "100%",
  marginBottom: spacing.xxl,
}

const $welcomeFace: ImageStyle = {
  height: 169,
  width: 269,
  position: "absolute",
  bottom: -47,
  right: -80,
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $welcomeHeading: ThemedStyle<TextStyle> = (theme) => ({
  marginBottom: spacing.md,
  color: theme.colors.text,
})
