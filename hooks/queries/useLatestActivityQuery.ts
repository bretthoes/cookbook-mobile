import { getLatestActivity } from "@/services/api/wrappers/notifications"
import { queryKeys } from "@/services/query/queryKeys"
import { ApiQueryError } from "@/services/query/unwrapApiResult"
import type { NotificationItem } from "@/types/notification"
import { useQuery } from "@tanstack/react-query"

export function useLatestActivityQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.latest(),
    queryFn: async (): Promise<NotificationItem | null> => {
      const result = await getLatestActivity()
      if (result.kind !== "ok") throw new ApiQueryError(result)
      if (!("id" in result)) return null
      const { kind: _kind, ...notification } = result
      return notification as NotificationItem
    },
  })
}
