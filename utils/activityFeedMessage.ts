import type { TxKeyPath } from "@/i18n"
import type { NotificationItem } from "@/types/notification"
import { NotificationActionTypeValues } from "@/types/notification"

export function getActivityFeedMessageKey(actionType: number): TxKeyPath | null {
  switch (actionType) {
    case NotificationActionTypeValues.NewRecipe:
      return "activityFeedScreen:newRecipe"
    case NotificationActionTypeValues.RecipeMade:
      return "activityFeedScreen:recipeMade"
    case NotificationActionTypeValues.MemberJoined:
      return "activityFeedScreen:memberJoined"
    case NotificationActionTypeValues.MemberLeft:
      return "activityFeedScreen:memberLeft"
    case NotificationActionTypeValues.MemberRemoved:
      return "activityFeedScreen:memberRemoved"
    default:
      return null
  }
}

export function getActivityFeedMessageOptions(notification: NotificationItem) {
  return {
    actorDisplayName: notification.actorDisplayName ?? "",
    subjectDisplayName: notification.subjectDisplayName ?? "",
    recipeTitle: notification.recipeTitle ?? "",
    cookbookTitle: notification.cookbookTitle,
  }
}
