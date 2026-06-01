import type { NotificationItem, NotificationListSnapshotIn } from "@/types/notification"
import { apiClientInstance } from "@/services/api/client"
import {
  ApiResult,
  toOkResult,
  toProblemFromError,
  toProblemFromResponse,
} from "@/services/api/toApiResult"

const { client } = apiClientInstance

export async function getNotifications(
  pageNumber: number,
  pageSize: number,
): Promise<ApiResult<{ notifications: NotificationListSnapshotIn }>> {
  try {
    const { data, error, response } = await client.GET("/api/Notifications", {
      params: { query: { PageNumber: pageNumber, PageSize: pageSize } },
    })
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "not-found" }
    return toOkResult({ notifications: data as NotificationListSnapshotIn })
  } catch (e) {
    return toProblemFromError(e)
  }
}

export async function getLatestActivity(): Promise<
  ApiResult<NotificationItem> | { kind: "ok" }
> {
  try {
    const { data, error, response } = await client.GET("/api/Notifications/latest")
    if (response.status === 204) return { kind: "ok" }
    if (!response.ok)
      return toProblemFromResponse(response, (error ?? null) as { detail?: string } | null)
    if (!data) return { kind: "ok" }
    return toOkResult(data as NotificationItem)
  } catch (e) {
    return toProblemFromError(e)
  }
}
