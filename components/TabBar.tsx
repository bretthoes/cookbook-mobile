import { Text } from "@/components/Text"
import { useInvitationStore } from "@/stores/invitationStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import React from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { Badge } from "./Badge"

export function TabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props
  const { themed, theme } = useAppTheme()
  const invitationTotalCount = useInvitationStore((s) => s.invitations.totalCount)

  return (
    <View style={themed($tabBar)}>
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
        const inactiveColor = theme.colors.textDim
        const activeColor = theme.colors.tint
        const Icon = options.tabBarIcon ? (
          <View style={{ marginBottom: -6 }}>
            {options.tabBarIcon({
              focused: isFocused,
              color: isFocused ? activeColor : inactiveColor,
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

        const showBadge = route.name === "profile" && invitationTotalCount > 0

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={$tabBarItem}
          >
            <View style={$tabBarItemContent}>
              {Icon}
              <Text
                size="xs"
                style={{
                  color: isFocused ? activeColor : inactiveColor,
                }}
                text={label.toString()}
              />
              {showBadge && <Badge count={invitationTotalCount} style={$badge} />}
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const $tabBar: ThemedStyle<ViewStyle> = (theme) => ({
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
  shadowColor: theme.colors.text,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: theme.isDark ? 0.3 : 0.1,
  shadowRadius: 10,
  elevation: 10,
  backgroundColor: theme.colors.backgroundDim,
})

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
