import type { components } from "@/services/api/generated/schema"
import type { PaginatedList } from "@/types/pagination"

export type NotificationItem = components["schemas"]["NotificationDto"]

export type NotificationActionType = components["schemas"]["CookbookNotificationActionType"]

export const NotificationActionTypeValues = {
  NewRecipe: 6,
  RecipeMade: 7,
  MemberJoined: 8,
  MemberLeft: 9,
  MemberRemoved: 10,
} as const satisfies Record<string, NotificationActionType>

export type NotificationListPage = components["schemas"]["PaginatedListOfNotificationDto"]

export type NotificationListSnapshotIn = PaginatedList<NotificationItem>
