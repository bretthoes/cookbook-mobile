import React, { useState, useEffect } from "react"
import * as Application from "expo-application"
import {
  LayoutAnimation,
  Linking,
  Platform,
  TextStyle,
  View,
  ViewStyle,
  Image,
  ImageStyle,
} from "react-native"
import { Button, ListItem, Screen, Switch, Text } from "src/components"
import { colors, spacing } from "src/theme"
import { isRTL } from "src/i18n"
import { useStores } from "src/models/helpers/useStores"
import { useAppTheme } from "src/utils/useAppTheme"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import config from "src/config/config.dev"

const reactNativeNewsletterLogo = require("assets/images/demo/rnn-logo.png")

// TODO i18n
function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url))
}

export default function Profile() {
  const {
    authenticationStore: { logout },
    membershipStore: { email },
  } = useStores()

  const [useFloatingTabBar, setUseFloatingTabBar] = useState(true)

  const router = useRouter()

  useEffect(() => {
    AsyncStorage.getItem("useFloatingTabBar").then((value) => {
      if (value !== null) {
        setUseFloatingTabBar(value === "true")
      }
    })
  }, [])

  const toggleFloatingTabBar = async () => {
    const newValue = !useFloatingTabBar
    setUseFloatingTabBar(newValue)
    await AsyncStorage.setItem("useFloatingTabBar", String(newValue))
  }

  const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null
  // @ts-expect-error
  const usingFabric = global.nativeFabricUIManager != null

  const { themeContext, setThemeContextOverride } = useAppTheme()

  useEffect(() => {
    AsyncStorage.getItem("themeContext").then((value) => {
      if (value !== null) {
        setThemeContextOverride(value as "light" | "dark")
      }
    })
  }, [])

  const toggleTheme = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    const newTheme = themeContext === "dark" ? "light" : "dark"
    setThemeContextOverride(newTheme)
    await AsyncStorage.setItem("themeContext", newTheme)
  }

  const demoReactotron = React.useMemo(
    () => async () => {
      if (__DEV__) {
        console.tron.display({
          name: "DISPLAY",
          value: {
            appId: Application.applicationId,
            appName: Application.applicationName,
            appVersion: Application.nativeApplicationVersion,
            appBuildVersion: Application.nativeBuildVersion,
            hermesEnabled: usingHermes,
          },
          important: true,
        })
      }
    },
    [],
  )

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$container}>
      <Text
        style={$reportBugsLink}
        tx="profileScreen:reportBugs"
        onPress={() =>
          openLinkInBrowser(`mailto:${config.SUPPORT_EMAIL}?subject=Language%20Support%20Request`)
        }
      />
      <Text style={$title} preset="heading" tx="profileScreen:title" />
      {email && <Text style={$title} preset="subheading" text={email} />}

      <Text preset="subheading" text="Actions" style={$sectionTitle} />
      <Text text="Manage your info in the app." style={$description} />
      <ListItem
        text="View your pending invitations"
        bottomSeparator
        rightIcon={isRTL ? "caretLeft" : "caretRight"}
        LeftComponent={
          <View style={$logoContainer}>
            <Image source={reactNativeNewsletterLogo} style={$logo} />
          </View>
        }
        onPress={() => router.push("/(app)/invitation")}
      />
      <ListItem
        text="Manage your cookbooks"
        bottomSeparator
        rightIcon={isRTL ? "caretLeft" : "caretRight"}
        LeftComponent={
          <View style={$logoContainer}>
            <Image source={reactNativeNewsletterLogo} style={$logo} />
          </View>
        }
        onPress={() => router.push({
          pathname: "/(app)/select-cookbook",
          params: {
            nextRoute: "/(app)/membership/list",
            action: "Select a cookbook to view its members.",
          },
        })}
      />

      <Text preset="subheading" text="Preferences" style={$sectionTitle} />
      <Text
        text="Use the 'Report Bugs' button to request support for more languages."
        style={$description}
      />
      <View style={$themeRow}>
        <Text text="Dark Mode" />
        <Switch value={themeContext === "dark"} onValueChange={toggleTheme} />
      </View>
      {/*<View style={$themeRow}> // TODO disabled for now; need to fix padding when floating tab bar is disabled
        <Text text="Floating Tab Bar" />
        <Switch
          value={useFloatingTabBar}
          onValueChange={toggleFloatingTabBar}
        />
      </View>*/}
      <ListItem
        text="Choose your preferred language"
        leftIcon="components"
        onPress={() => router.push("/(app)/language" as any)}
        rightIcon={isRTL ? "caretLeft" : "caretRight"}
        bottomSeparator
      />
      <ListItem
        text="Set your display name"
        bottomSeparator
        rightIcon={isRTL ? "caretLeft" : "caretRight"}
        LeftComponent={
          <View style={$logoContainer}>
            <Image source={reactNativeNewsletterLogo} style={$logo} />
          </View>
        }
        onPress={() => router.push("/(app)/set-display-name")}
      />
      <View style={$buttonContainer}>
        <Button style={$button} tx="common:logOut" onPress={logout} />
      </View>
      <View style={$itemsContainer}>
        <Text preset="subheading" tx="demoDebugScreen:title" />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">App Id</Text>
              <Text>{Application.applicationId}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">App Name</Text>
              <Text>{Application.applicationName}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">App Version</Text>
              <Text>{Application.nativeApplicationVersion}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">App Build Version</Text>
              <Text>{Application.nativeBuildVersion}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Hermes Enabled</Text>
              <Text>{String(usingHermes)}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View style={$item}>
              <Text preset="bold">Fabric Enabled</Text>
              <Text>{String(usingFabric)}</Text>
            </View>
          }
        />
      </View>
      <View style={$buttonContainer}>
        <Button style={$button} tx="demoDebugScreen:reactotron" onPress={demoReactotron} />
        <Text style={$hint} tx={`demoDebugScreen:${Platform.OS}ReactotronHint` as const} />
      </View>
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingBottom: spacing.xxl,
  paddingHorizontal: spacing.lg,
}

const $themeRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
  paddingVertical: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: colors.separator,
}

const $title: TextStyle = {
  marginBottom: spacing.md,
}

const $reportBugsLink: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.lg,
  alignSelf: isRTL ? "flex-start" : "flex-end",
}

const $item: ViewStyle = {
  marginBottom: spacing.md,
}

const $itemsContainer: ViewStyle = {
  marginBottom: spacing.xl,
}

const $button: ViewStyle = {
  marginTop: spacing.xxl,
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $sectionTitle: TextStyle = {
  marginTop: spacing.xxl,
}

const $description: TextStyle = {
  marginBottom: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.palette.neutral600,
  fontSize: 12,
  lineHeight: 15,
  paddingBottom: spacing.lg,
}

const $logoContainer: ViewStyle = {
  marginEnd: spacing.md,
  flexDirection: "row",
  flexWrap: "wrap",
  alignContent: "center",
}

const $logo: ImageStyle = {
  height: 38,
  width: 38,
}
