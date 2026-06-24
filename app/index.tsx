// @mst replace-next-line
import { Button } from "@/components/Button"
import { useIsAuthenticated } from "@/stores/authStore"
import { type ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { Redirect, useRouter } from "expo-router"
import { DrawRevealImage } from "@/components/DrawRevealImage"
import { useEffect, useMemo } from "react"
import { useWindowDimensions, View, ViewStyle } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated"

const welcomeLogo = require("../assets/images/logo.png")

// @mst replace-next-line export default function WelcomeScreen() {
export default function WelcomeScreen() {
  const isAuthenticated = useIsAuthenticated()
  const { themed } = useAppTheme()
  const { width: winWidth, height: winHeight } = useWindowDimensions()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const router = useRouter()

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedCenter = useMemo(() => themed($centerArea), [themed])
  const $themedBottom = useMemo(() => themed($bottomArea), [themed])
  const $themedLoginButton = useMemo(() => themed($loginButton), [themed])
  const $themedLoginButtonPressed = useMemo(() => themed($loginButtonPressed), [themed])

  const logoSize = useMemo(() => {
    const w = Math.min(winWidth * 0.9, 420)
    const h = Math.min(winHeight * 0.22, 140)
    const s = 2 / 3
    return { width: w * s, height: h * s }
  }, [winWidth, winHeight])

  const buttonsOpacity = useSharedValue(0)
  const buttonsTranslateY = useSharedValue(20)

  useEffect(() => {
    buttonsOpacity.value = 0
    buttonsTranslateY.value = 20
    buttonsOpacity.value = withDelay(
      1100,
      withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) }),
    )
    buttonsTranslateY.value = withDelay(
      1100,
      withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }),
    )
  }, [buttonsOpacity, buttonsTranslateY])

  const $buttonsAnimated = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }))

  if (isAuthenticated) {
    return <Redirect href="/(logged-in)/(tabs)/cookbooks" />
  }

  return (
    <View style={$themedContainer}>
      <View style={$themedCenter}>
        <DrawRevealImage
          source={welcomeLogo}
          width={logoSize.width}
          height={logoSize.height}
          duration={1200}
          delay={250}
        />
      </View>

      <Animated.View style={[$themedBottom, $bottomContainerInsets, $buttonsAnimated]}>
        <View style={$buttonGroup}>
          <Button
            tx="welcomeScreen:registerButton"
            preset="reversed"
            onPress={() => router.push("/register-options")}
          />
          <Button
            tx="welcomeScreen:loginButton"
            preset="default"
            onPress={() => router.push("/login-options")}
            style={$themedLoginButton}
            pressedStyle={$themedLoginButtonPressed}
          />
        </View>
      </Animated.View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})

const $centerArea: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: theme.spacing.md,
})

const $bottomArea: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.sm,
})

const $buttonGroup: ViewStyle = {
  justifyContent: "flex-end",
}

const $loginButton: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.sm,
  backgroundColor: theme.colors.transparent,
  borderWidth: 2,
  borderColor: theme.colors.text,
})

const $loginButtonPressed: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.palette.overlay20,
  borderColor: theme.colors.text,
})
