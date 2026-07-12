import { AndroidTabBar } from "@/components/AndroidTabBar"
import { Icon } from "@/components/Icon"
import { TabBar } from "@/components/TabBar"
import { translate } from "@/i18n"
import { colors, spacing, typography } from "@/theme"
import { Tabs } from "expo-router/tabs"
import { Platform, TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const isIos = Platform.OS === "ios"

export default function Layout() {
  const { bottom } = useSafeAreaInsets()

  return (
    <Tabs
      tabBar={(props) => (isIos ? <TabBar {...props} /> : <AndroidTabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: isIos ? [$iosTabBar, { height: bottom + 70 }] : $androidTabBar,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text,
        tabBarLabelStyle: $tabBarLabel,
        tabBarItemStyle: $tabBarItem,
      }}
    >
      <Tabs.Screen
        name="cookbooks"
        options={{
          href: "./cookbooks",
          headerShown: false,
          tabBarAccessibilityLabel: translate("tabNavigator:cookbookListTab"),
          tabBarLabel: translate("tabNavigator:cookbookListTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="cookbooks" size={30} color={focused ? colors.tint : undefined} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: "./create",
          headerShown: false,
          tabBarLabel: translate("tabNavigator:createTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="create" size={30} color={focused ? colors.tint : undefined} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "./(logged-in)/(tabs)/profile",
          headerShown: false,
          tabBarLabel: translate("tabNavigator:profileTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="user" size={28} color={focused ? colors.tint : undefined} />
          ),
        }}
      />
    </Tabs>
  )
}

const $iosTabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
}

const $androidTabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopWidth: 0,
  elevation: 0,
}

const $tabBarItem: ViewStyle = {
  paddingTop: spacing.md,
}

const $tabBarLabel: TextStyle = {
  fontSize: 12,
  fontFamily: typography.primary.medium,
  lineHeight: 16,
  flex: 1,
}
