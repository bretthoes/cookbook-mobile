import React, { useState, useEffect } from "react"
import { Tabs } from "expo-router/tabs"
import { observer } from "mobx-react-lite"
import { Icon } from "src/components"
import { translate } from "src/i18n"
import { colors, spacing, typography } from "src/theme"
import { TextStyle, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Ionicons from "@expo/vector-icons/Ionicons"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import AntDesign from "@expo/vector-icons/AntDesign"
import { TabBar } from "src/components/TabBar"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default observer(function Layout() {
  const { bottom } = useSafeAreaInsets()
  const [useFloatingTabBar, setUseFloatingTabBar] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem("useFloatingTabBar").then((value) => {
      if (value !== null) {
        setUseFloatingTabBar(value === "true")
      }
    })
  }, [])

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
          href: "/cookbooks",
          headerShown: false,
          tabBarAccessibilityLabel: translate("demoNavigator:cookbookListTab"),
          tabBarLabel: translate("demoNavigator:cookbookListTab"),
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="bookshelf"
              color={focused ? colors.tint : undefined}
              size={30}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: "/create",
          headerShown: false,
          tabBarLabel: translate("demoNavigator:createTab"),
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name="add-circle-outline"
              color={focused ? colors.tint : undefined}
              size={30}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: "/(app)/(tabs)/profile",
          headerShown: false,
          tabBarLabel: translate("demoNavigator:profileTab"),
          tabBarIcon: ({ focused }) => (
            <AntDesign name="user" color={focused ? colors.tint : undefined} size={30} />
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
