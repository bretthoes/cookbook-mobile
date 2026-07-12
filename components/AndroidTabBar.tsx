import { Text } from "@/components/Text"
import { useInvitationStore } from "@/stores/invitationStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import React from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Badge } from "./Badge"

const TAB_BAR_HEIGHT = 56

export function AndroidTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props
  const { themed, theme } = useAppTheme()
  const { bottom } = useSafeAreaInsets()
  const invitationTotalCount = useInvitationStore((s) => s.invitations.totalCount)

  return (
    <View style={[themed($tabBar), { paddingBottom: bottom, minHeight: TAB_BAR_HEIGHT + bottom }]}>
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
          options.tabBarIcon({
            focused: isFocused,
            color: isFocused ? activeColor : inactiveColor,
            size: 24,
          })
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
                  marginTop: theme.spacing.xxs,
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
  alignItems: "center",
  backgroundColor: theme.colors.background,
  borderTopWidth: 1,
  borderTopColor: theme.colors.separator,
  elevation: 8,
  paddingTop: theme.spacing.xs,
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
