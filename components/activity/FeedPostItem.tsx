import { Text } from "@/components/Text"
import type { NotificationItem } from "@/types/notification"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import {
  getActivityFeedMessageKey,
  getActivityFeedMessageOptions,
} from "@/utils/activityFeedMessage"
import { formatActivityTimeAgo } from "@/utils/formatActivityTimeAgo"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, TextStyle, View, ViewStyle } from "react-native"

interface FeedPostItemProps {
  item: NotificationItem
  /** Happened since the person last opened the feed. */
  isNew?: boolean
}

export function FeedPostItem({ item, isNew = false }: FeedPostItemProps) {
  const { themed } = useAppTheme()
  const router = useRouter()
  const messageKey = getActivityFeedMessageKey(item)
  const isImportant = item.isImportant ?? false
  const canOpenRecipe = item.recipeId != null
  const $themedPost = useMemo(() => themed($post), [themed])
  const $themedPostImportant = useMemo(() => themed($postImportant), [themed])
  const $themedNewPill = useMemo(() => themed($newPill), [themed])
  const $themedNewText = useMemo(() => themed($newText), [themed])

  const handlePress = () => {
    if (canOpenRecipe) router.push(`/(logged-in)/recipe/${item.recipeId}`)
  }

  return (
    <Pressable
      onPress={canOpenRecipe ? handlePress : undefined}
      disabled={!canOpenRecipe}
      style={[$themedPost, (isImportant || isNew) && $themedPostImportant]}
    >
      {messageKey ? (
        <Text
          preset={isImportant ? "bold" : "default"}
          tx={messageKey}
          txOptions={getActivityFeedMessageOptions(item)}
        />
      ) : (
        <Text preset={isImportant ? "bold" : "default"} text={item.cookbookTitle} />
      )}
      <View style={$metaRow}>
        <Text preset="formHelper" size="xs" text={formatActivityTimeAgo(item.created)} />
        {isNew ? (
          <View style={$themedNewPill}>
            <Text tx="feedScreen:new" size="xxs" weight="medium" style={$themedNewText} />
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

const $post: ThemedStyle<ViewStyle> = (theme) => ({
  marginBottom: theme.spacing.md,
  padding: theme.spacing.md,
  borderRadius: theme.spacing.sm,
  backgroundColor: theme.colors.backgroundDim,
  borderWidth: 1,
  borderColor: theme.colors.separator,
})

const $postImportant: ThemedStyle<ViewStyle> = (theme) => ({
  borderLeftWidth: 3,
  borderLeftColor: theme.colors.tint,
})

const $metaRow: ViewStyle = {
  marginTop: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $newPill: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.xs,
  paddingVertical: theme.spacing.xxxs,
  borderRadius: theme.spacing.xs,
  backgroundColor: theme.colors.tint,
})

const $newText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
})
