import type { TxKeyPath } from "@/i18n"
import type { NotificationItem } from "@/types/notification"
import { NotificationActionTypeValues } from "@/types/notification"

type ActivityFeedMessage = {
  actionType: number
  actorIsCurrentUser?: boolean
  subjectIsCurrentUser?: boolean
}

export function getActivityFeedMessageKey(notification: ActivityFeedMessage): TxKeyPath | null {
  const actorIsYou = notification.actorIsCurrentUser === true
  const subjectIsYou = notification.subjectIsCurrentUser === true

  switch (notification.actionType) {
    case NotificationActionTypeValues.NewRecipe:
      return actorIsYou ? "activityFeedScreen:newRecipeYou" : "activityFeedScreen:newRecipe"
    case NotificationActionTypeValues.RecipeMade:
      return actorIsYou ? "activityFeedScreen:recipeMadeYou" : "activityFeedScreen:recipeMade"
    case NotificationActionTypeValues.MemberJoined:
      return subjectIsYou ? "activityFeedScreen:memberJoinedYou" : "activityFeedScreen:memberJoined"
    case NotificationActionTypeValues.MemberLeft:
      return subjectIsYou ? "activityFeedScreen:memberLeftYou" : "activityFeedScreen:memberLeft"
    case NotificationActionTypeValues.MemberRemoved:
      return actorIsYou ? "activityFeedScreen:memberRemovedYou" : "activityFeedScreen:memberRemoved"
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
