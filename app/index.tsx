// @mst replace-next-line
import { Button } from "@/components/Button"
import { useStores } from "@/models/helpers/useStores"
import { type ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"
import { Redirect, useRouter } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { Image, ImageStyle, useWindowDimensions, View, ViewStyle } from "react-native"

const welcomeLogo = require("../assets/images/logo.png")

// @mst replace-next-line export default function WelcomeScreen() {
export default observer(function WelcomeScreen() {
  const {
    authenticationStore: { isAuthenticated },
  } = useStores()
  const { themed } = useAppTheme()
  const { width: winWidth, height: winHeight } = useWindowDimensions()
  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])
  const router = useRouter()

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedCenter = useMemo(() => themed($centerArea), [themed])
  const $themedBottom = useMemo(() => themed($bottomArea), [themed])
  const $themedLoginButton = useMemo(() => themed($loginButton), [themed])
  const $themedLoginButtonPressed = useMemo(() => themed($loginButtonPressed), [themed])

  const $welcomeLogo: ImageStyle = useMemo(() => {
    const w = Math.min(winWidth * 0.9, 420)
    const h = Math.min(winHeight * 0.22, 140)
    const s = 2 / 3
    return { width: w * s, height: h * s }
  }, [winWidth, winHeight])

  if (isAuthenticated) {
    return <Redirect href="/(logged-in)/(tabs)/cookbooks" />
  }

  return (
    <View style={$themedContainer}>
      <View style={$themedCenter}>
        <Image source={welcomeLogo} style={$welcomeLogo} resizeMode="contain" />
      </View>

      <View style={[$themedBottom, $bottomContainerInsets]}>
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
      </View>
    </View>
  )
  // @mst replace-next-line }
})

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
