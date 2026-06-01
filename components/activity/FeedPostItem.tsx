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
import { Pressable, View, ViewStyle } from "react-native"

interface FeedPostItemProps {
  item: NotificationItem
}

export function FeedPostItem({ item }: FeedPostItemProps) {
  const { themed } = useAppTheme()
  const router = useRouter()
  const messageKey = getActivityFeedMessageKey(item.actionType)
  const isImportant = item.isImportant ?? false
  const canOpenRecipe = item.recipeId != null

  const handlePress = () => {
    if (canOpenRecipe) router.push(`/(logged-in)/recipe/${item.recipeId}`)
  }

  return (
    <Pressable
      onPress={canOpenRecipe ? handlePress : undefined}
      disabled={!canOpenRecipe}
      style={[themed($post), isImportant && themed($postImportant)]}
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
}
