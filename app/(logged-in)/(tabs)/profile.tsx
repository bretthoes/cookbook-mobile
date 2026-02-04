import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { ListItem } from "@/components/ListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle"
import { UseCase } from "@/components/UseCase"
import config from "@/config/config.dev"
import { isRTL } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Application from "expo-application"
import { useRouter } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { LayoutAnimation, Linking, TextStyle, View, ViewStyle } from "react-native"

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
          topSeparator
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
          onPress={() => router.push("../invitation")}
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
              pathname: "../select-cookbook",
              params: {
                nextRoute: "../membership/list",
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
          topSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          rightIconColor={isDark ? colors.border : colors.text}
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="darkMode" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          RightComponent={
            <View style={$iconContainer}>
              <Switch value={themeContext === "dark"} onValueChange={toggleTheme} />
            </View>
          }
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
          onPress={() => router.push("../language")}
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
          onPress={() => router.push("../set-display-name")}
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
