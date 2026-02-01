import { Icon } from "@/components/Icon"
import { TabBar } from "@/components/TabBar"
import { translate } from "@/i18n"
import { colors, spacing, typography } from "@/theme"
import { Tabs } from "expo-router/tabs"
import { observer } from "mobx-react-lite"
import { useState } from "react"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export default observer(function Layout() {
  const { bottom } = useSafeAreaInsets()
  const [useFloatingTabBar, setUseFloatingTabBar] = useState(true)

  //useEffect(() => {
  //  AsyncStorage.getItem("useFloatingTabBar").then((value) => {
  //    if (value !== null) {
  //      setUseFloatingTabBar(value === "true")
  //    }
  //  })
  //}, [])

  return (
    <Tabs
      tabBar={useFloatingTabBar ? (props) => <TabBar {...props} /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: useFloatingTabBar ? [$tabBar, { height: bottom + 70 }] : undefined,
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
          tabBarAccessibilityLabel: translate("demoNavigator:cookbookListTab"),
          tabBarLabel: translate("demoNavigator:cookbookListTab"),
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
          tabBarLabel: translate("demoNavigator:createTab"),
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
          tabBarLabel: translate("demoNavigator:profileTab"),
          tabBarIcon: ({ focused }) => (
            <Icon icon="user" size={28} color={focused ? colors.tint : undefined} />
          ),
        }}
      />
    </Tabs>
  )
})

const $tabBar: ViewStyle = {
  backgroundColor: colors.background,
  borderTopColor: colors.transparent,
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
