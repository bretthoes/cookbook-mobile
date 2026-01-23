import { useEffect, useMemo } from "react"
import * as Application from "expo-application"
import {
  LayoutAnimation,
  Linking,
  Platform,
  TextStyle,
  View,
  ViewStyle,
  ImageStyle,
} from "react-native"
import { Button, ListItem, Screen, Switch, Text, UseCase, Badge, Icon } from "src/components"
import { colors, spacing } from "src/theme"
import { isRTL } from "src/i18n"
import { useStores } from "src/models/helpers/useStores"
import { useAppTheme } from "src/utils/useAppTheme"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import config from "src/config/config.dev"
import { observer } from "mobx-react-lite"
import React from "react"
import type { ThemedStyle } from "src/theme"

// TODO i18n
function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then((canOpen) => canOpen && Linking.openURL(url))
}

export default observer(function ProfileScreen() {
  const {
    authenticationStore: { logout },
    membershipStore: { email },
    invitationStore,
  } = useStores()

  const router = useRouter()

  const { themed } = useAppTheme()
  const { themeContext, setThemeContextOverride } = useAppTheme()
  const isDark = themeContext === "dark"

  // Fetch invitations when the profile tab is focused
  useEffect(() => {
    const fetchInvitations = async () => {
      await invitationStore.fetch()
    }
    fetchInvitations()
  }, [invitationStore])

  const usingHermes = typeof HermesInternal === "object" && HermesInternal !== null
  // @ts-expect-error
  const usingFabric = global.nativeFabricUIManager != null

  useEffect(() => {
    AsyncStorage.getItem("themeContext").then((value) => {
      if (value !== null) {
        setThemeContextOverride(value as "light" | "dark")
      }
    })
  }, [setThemeContextOverride])

  const toggleTheme = async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    const newTheme = themeContext === "dark" ? "light" : "dark"
    setThemeContextOverride(newTheme)
    await AsyncStorage.setItem("themeContext", newTheme)
  }

  const demoReactotron = useMemo(
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
    [usingHermes],
  )

  const $themedRoot = React.useMemo(() => themed($root), [themed])

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <View style={$titleContainer}>
        <Text
          style={$reportBugsLink}
          tx="profileScreen:reportBugs"
          onPress={() =>
            openLinkInBrowser(`mailto:${config.SUPPORT_EMAIL}?subject=Language%20Support%20Request`)
          }
        />
        <Text preset="heading" tx="profileScreen:title" />
        {email && <Text preset="default" text={email} />}
      </View>
      <UseCase tx="profileScreen:actions">
        <Text tx="profileScreen:manageInfo" style={$description} />
        <ListItem
          tx="profileScreen:pendingInvites"
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          rightIconColor={isDark ? colors.border : colors.text}
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="mail" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          RightComponent={
            <View style={$badgeContainer}>
              <Badge count={invitationStore.invitations.totalCount} />
            </View>
          }
          onPress={() => router.push("/(app)/invitation")}
        />
        <ListItem
          tx="profileScreen:manageMemberships"
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          rightIconColor={isDark ? colors.border : colors.text}
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="membership" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          onPress={() =>
            router.push({
              pathname: "/(app)/select-cookbook",
              params: {
                nextRoute: "/(app)/membership/list",
                action: "Select a cookbook to view its members.",
              },
            })
          }
        />
      </UseCase>
      <UseCase tx="profileScreen:preferences">
        <Text tx="profileScreen:customize" style={$description} />
        <ListItem
          tx="profileScreen:darkMode"
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          rightIconColor={isDark ? colors.border : colors.text}
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="darkMode" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          RightComponent={<Switch value={themeContext === "dark"} onValueChange={toggleTheme} />}
        />
        {/* <View style={$themeRow}> // TODO see above
        <Text text="Floating Tab Bar" />
        <Switch
          value={useFloatingTabBar}
          onValueChange={toggleFloatingTabBar}
        />
      </View> */}
        <ListItem
          tx="profileScreen:preferredLanguage"
          // leftIcon="components"
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="languages" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          onPress={() => router.push("/(app)/language")}
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          rightIconColor={isDark ? colors.border : colors.text}
          bottomSeparator
        />
        <ListItem
          tx="profileScreen:setName"
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          rightIconColor={isDark ? colors.border : colors.text}
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="user" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          onPress={() => router.push("/(app)/set-display-name")}
        />
      </UseCase>
      <View style={$buttonContainer}>
        <Button style={$button} tx="common:logOut" onPress={logout} />
      </View>
      <UseCase tx="demoDebugScreen:title">
        <ListItem
          LeftComponent={
            <View>
              <Text preset="bold">App Id</Text>
              <Text>{Application.applicationId}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View>
              <Text preset="bold">App Name</Text>
              <Text>{Application.applicationName}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View>
              <Text preset="bold">App Version</Text>
              <Text>{Application.nativeApplicationVersion}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View>
              <Text preset="bold">App Build Version</Text>
              <Text>{Application.nativeBuildVersion}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View>
              <Text preset="bold">Hermes Enabled</Text>
              <Text>{String(usingHermes)}</Text>
            </View>
          }
        />
        <ListItem
          LeftComponent={
            <View>
              <Text preset="bold">Fabric Enabled</Text>
              <Text>{String(usingFabric)}</Text>
            </View>
          }
        />
      </UseCase>
      <View style={$buttonContainer}>
        <Button style={$button} tx="demoDebugScreen:reactotron" onPress={demoReactotron} />
        <Text style={$hint} tx={`demoDebugScreen:${Platform.OS}ReactotronHint` as const} />
      </View>
    </Screen>
  )
})

const $titleContainer: ViewStyle = {
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.lg,
  paddingTop: spacing.xl + spacing.lg,
}

const $reportBugsLink: TextStyle = {
  color: colors.tint,
  marginBottom: spacing.lg,
  alignSelf: isRTL ? "flex-start" : "flex-end",
}

const $button: ViewStyle = {
  marginTop: spacing.lg,
  marginBottom: spacing.xs,
}

const $buttonContainer: ViewStyle = {
  marginBottom: spacing.xxxl,
  paddingHorizontal: spacing.xl,
}

const $description: TextStyle = {
  marginBottom: spacing.lg,
}

const $hint: TextStyle = {
  color: colors.textDim,
  fontSize: 12,
  lineHeight: 15,
  paddingBottom: spacing.lg,
}

const $iconContainer: ViewStyle = {
  marginEnd: spacing.md,
  marginTop: spacing.xs,
  justifyContent: "center",
  alignItems: "center",
  width: 38,
  height: 38,
}

const $badgeContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginRight: spacing.xs,
}

const $root: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.background,
})
