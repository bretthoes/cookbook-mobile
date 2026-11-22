import { Text } from "@/components/Text"
import { useFeedHasUnseen } from "@/hooks/useFeedUnseen"
import { useInvitationStore } from "@/stores/invitationStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import type { BottomTabBarProps } from "expo-router/tabs"
import React from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { Badge } from "./Badge"

const FLOATING_TAB_BAR_BOTTOM_OFFSET = 12

export function TabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props
  const { themed, theme } = useAppTheme()
  const invitationTotalCount = useInvitationStore((s) => s.invitations.totalCount)
  const feedHasUnseen = useFeedHasUnseen(state.routes[state.index]?.name ?? "")

  return (
    <View style={[themed($tabBar), { bottom: FLOATING_TAB_BAR_BOTTOM_OFFSET }]}>
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
        const showDot = route.name === "feed" && feedHasUnseen && !isFocused

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
              {showDot && <View style={themed($dot)} />}
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
  left: 0,
  right: 0,
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

const $dot: ThemedStyle<ViewStyle> = (theme) => ({
  position: "absolute",
  top: -2,
  right: -2,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: theme.colors.tint,
  borderWidth: 2,
  borderColor: theme.colors.backgroundDim,
})
