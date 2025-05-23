import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import React from "react"
import { Text } from "src/components"
import { View, TouchableOpacity, ViewStyle, TextStyle } from "react-native"
import { colors, spacing } from "src/theme"
import { useAppTheme } from "src/utils/useAppTheme"
import { useStores } from "src/models/helpers/useStores"
import { observer } from "mobx-react-lite"
import { Badge } from "./Badge"

export const TabBar = observer(function TabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props
  const { themeContext } = useAppTheme()
  const { invitationStore } = useStores()

  const isDark = themeContext === "dark"

  return (
    <View style={[$tabBar, isDark && $tabBarDark]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name

        if (["_sitemap", "+not-found"].includes(route.name)) return null

        const isFocused = state.index === index
        const Icon = options.tabBarIcon ? (
          <View style={{ marginBottom: -6 }}>
            {options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? colors.tint : isDark ? colors.border : colors.textDim,
              size: 24,
            })}
          </View>
        ) : null

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params)
          }
        }

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          })
        }

        const showBadge = route.name === "profile" && invitationStore.invitations.totalCount > 0

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={$tabBarItem}
          >
            <View style={$tabBarItemContent}>
              {Icon}
              <Text
                style={{
                  color: isFocused ? colors.tint : isDark ? colors.border : colors.textDim,
                }}
                text={label.toString()}
              />
              {showBadge && (
                <Badge
                  count={invitationStore.invitations.totalCount}
                  style={$badge}
                />
              )}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
})

const $tabBar: ViewStyle = {
  flexDirection: "row",
  position: "absolute",
  bottom: 12,
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 20,
  marginHorizontal: 20,
  paddingVertical: 10,
  borderRadius: 25,
  borderCurve: "continuous",
  shadowColor: colors.text,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10,
  backgroundColor: colors.backgroundDim,
}

const $tabBarDark: ViewStyle = {
  backgroundColor: colors.text,
  shadowColor: colors.text,
  shadowOpacity: 0.3,
}

const $tabBarItem: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
}

const $tabBarItemContent: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
}

const $badge: ViewStyle = {
  position: "absolute",
  top: -8,
  right: -8,
}
