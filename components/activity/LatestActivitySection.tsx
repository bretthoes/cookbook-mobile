import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { useLatestActivityQuery } from "@/hooks/queries/useLatestActivityQuery"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import {
  getActivityFeedMessageKey,
  getActivityFeedMessageOptions,
} from "@/utils/activityFeedMessage"
import { formatActivityTimeAgo } from "@/utils/formatActivityTimeAgo"
import { useFocusEffect, useRouter } from "expo-router"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

export function LatestActivitySection() {
  const { themed } = useAppTheme()
  const router = useRouter()
  const { t } = useTranslation()
  const { data: latest, refetch } = useLatestActivityQuery()

  useFocusEffect(
    useCallback(() => {
      void refetch()
    }, [refetch]),
  )

  const openFeed = () => router.push("/(logged-in)/activity")

  return (
    <View style={$section}>
      <Text preset="subheading" tx="cookbooksScreen:latestActivityHeading" style={$heading} />
      {latest ? (
        <Pressable
          onPress={openFeed}
          style={themed($preview)}
          accessibilityRole="button"
          accessibilityLabel={t("cookbooksScreen:activityFeedAccessibility")}
        >
          {getActivityFeedMessageKey(latest.actionType) ? (
            <Text
              preset="default"
              numberOfLines={3}
              tx={getActivityFeedMessageKey(latest.actionType)!}
              txOptions={getActivityFeedMessageOptions(latest)}
            />
          ) : (
            <Text preset="default" numberOfLines={3} text={latest.cookbookTitle} />
          )}
          <Text preset="formHelper" size="xs" text={formatActivityTimeAgo(latest.created)} />
          <View style={$seeAllRow}>
            <Text preset="formLabel" size="xs" tx="cookbooksScreen:seeAllActivity" />
            <Icon icon="caretRight" size={16} />
          </View>
        </Pressable>
      ) : (
        <Pressable onPress={openFeed} style={themed($previewEmpty)} accessibilityRole="button">
          <Text preset="formHelper" tx="cookbooksScreen:noActivityYet" />
        </Pressable>
      )}
    </View>
  )
}

const $section: ViewStyle = {
  marginTop: 8,
}

const $heading: TextStyle = {
  marginBottom: 12,
}

const $preview: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  borderRadius: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  borderWidth: 1,
  borderColor: theme.colors.separator,
  gap: theme.spacing.xs,
})

const $previewEmpty: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
  borderRadius: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  borderWidth: 1,
  borderColor: theme.colors.separator,
})

const $seeAllRow: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 4,
  marginTop: 4,
}
