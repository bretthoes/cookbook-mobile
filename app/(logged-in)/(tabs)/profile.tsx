import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { ListItem } from "@/components/ListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { Switch } from "@/components/Toggle"
import { SectionCard } from "@/components/SectionCard"
import Config from "@/config"
import { isRTL, translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
import type { ThemedStyle } from "@/theme"
import { colors, spacing } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { isRevenueCatConfigured, presentCustomerCenter } from "@/services/subscription/revenueCat"
import { openLinkInBrowser } from "@/utils/openLinkInBrowser"
import { resolveRevenueCatAppUserId } from "@/utils/resolveRevenueCatAppUserId"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Application from "expo-application"
import { useRouter } from "expo-router"
import { observer } from "mobx-react-lite"
import React, { useCallback, useEffect } from "react"
import { Alert, LayoutAnimation, TextStyle, View, ViewStyle } from "react-native"

export default observer(function ProfileScreen() {
  const {
    authenticationStore,
    membershipStore: { email },
    invitationStore,
    subscriptionStore,
  } = useStores()

  const router = useRouter()

  const { themed, themeContext, setThemeContextOverride, largeFontEnabled, setLargeFontEnabled } =
    useAppTheme()
  const isDark = themeContext === "dark"

  // Fetch invitations when the profile tab is focused
  useEffect(() => {
    const fetchInvitations = async () => {
      await invitationStore.fetch()
    }
    fetchInvitations()
  }, [invitationStore])

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

  const { logout, authEmail, userId } = authenticationStore

  const handleSubscriptionPress = useCallback(async () => {
    if (!isRevenueCatConfigured()) {
      router.push("/(logged-in)/recipe/paywall")
      return
    }

    if (subscriptionStore.isPro) {
      const appUserId = await resolveRevenueCatAppUserId({
        storedUserId: userId,
        authEmail,
      })
      if (!appUserId) {
        router.push("/(logged-in)/recipe/paywall")
        return
      }
      try {
        await presentCustomerCenter(appUserId)
        await subscriptionStore.refresh(appUserId)
      } catch {
        Alert.alert(translate("profileScreen:customerCenterError"))
      }
      return
    }

    router.push("/(logged-in)/recipe/paywall")
  }, [router, subscriptionStore, authEmail, userId])

  const $themedRoot = React.useMemo(() => themed($root), [themed])

  return (
    <Screen preset="scroll" style={$themedRoot}>
      <View style={$titleContainer}>
        <Text
          style={$reportBugsLink}
          tx="profileScreen:reportBugs"
          onPress={() =>
            openLinkInBrowser(`mailto:${Config.SUPPORT_EMAIL}?subject=Language%20Support%20Request`)
          }
        />
        <Text preset="heading" tx="profileScreen:title" />
        {email && <Text preset="default" text={email} />}
      </View>
      <SectionCard headingTx="profileScreen:actions">
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
                action: translate("selectCookbookScreen:actionForMembers"),
              },
            })
          }
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
        {isRevenueCatConfigured() && (
          <ListItem
            tx={
              subscriptionStore.isPro
                ? "profileScreen:manageSubscription"
                : "profileScreen:upgradeToPro"
            }
            bottomSeparator
            rightIcon={isRTL ? "caretLeft" : "caretRight"}
            rightIconColor={isDark ? colors.border : colors.text}
            LeftComponent={
              <View style={$iconContainer}>
                <Icon icon="heart" size={30} color={isDark ? colors.border : colors.text} />
              </View>
            }
            onPress={handleSubscriptionPress}
          />
        )}
      </SectionCard>
      <SectionCard headingTx="profileScreen:preferences">
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
        <ListItem
          tx="profileScreen:largeFont"
          bottomSeparator
          LeftComponent={
            <View style={$iconContainer}>
              <Icon icon="view" size={30} color={isDark ? colors.border : colors.text} />
            </View>
          }
          RightComponent={
            <View style={$iconContainer}>
              <Switch value={largeFontEnabled} onValueChange={setLargeFontEnabled} />
            </View>
          }
        />
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
      </SectionCard>
      <View style={$buttonContainer}>
        <Button style={$button} tx="common:logOut" onPress={logout} />
      </View>
      {__DEV__ && (
        <SectionCard headingTx="demoDebugScreen:title">
          <ListItem
            LeftComponent={
              <View>
                <Text preset="bold" tx="demoDebugScreen:appId" />
                <Text>{Application.applicationId}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View>
                <Text preset="bold" tx="demoDebugScreen:appName" />
                <Text>{Application.applicationName}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View>
                <Text preset="bold" tx="demoDebugScreen:appVersion" />
                <Text>{Application.nativeApplicationVersion}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View>
                <Text preset="bold" tx="demoDebugScreen:appBuildVersion" />
                <Text>{Application.nativeBuildVersion}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View>
                <Text preset="bold" tx="demoDebugScreen:hermesEnabled" />
                <Text>{String(typeof HermesInternal === "object" && HermesInternal !== null)}</Text>
              </View>
            }
          />
          <ListItem
            LeftComponent={
              <View>
                <Text preset="bold" tx="demoDebugScreen:fabricEnabled" />
                {/* @ts-expect-error */}
                <Text>{String(global.nativeFabricUIManager != null)}</Text>
              </View>
            }
          />
        </SectionCard>
      )}
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
