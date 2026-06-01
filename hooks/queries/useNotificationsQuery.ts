import { NOTIFICATION_LIST_PAGE_SIZE } from "@/constants/pagination"
import { getNotifications } from "@/services/api/wrappers/notifications"
import { queryKeys } from "@/services/query/queryKeys"
import { unwrapApiResult } from "@/services/query/unwrapApiResult"
import type { NotificationItem, NotificationListPage } from "@/types/notification"
import { useInfiniteQuery } from "@tanstack/react-query"

type NotificationListPageData = {
  items: NotificationItem[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
}

function normalizeNotificationList(page: NotificationListPage): NotificationListPageData {
  return {
    items: (page.items ?? []) as NotificationItem[],
    pageNumber: page.pageNumber ?? 1,
    totalPages: page.totalPages ?? 1,
    totalCount: page.totalCount ?? 0,
    hasNextPage: page.hasNextPage ?? false,
  }
}

async function fetchNotificationsPage(pageNumber: number) {
  const result = await getNotifications(pageNumber, NOTIFICATION_LIST_PAGE_SIZE)
  const data = unwrapApiResult(result)
  return normalizeNotificationList(data.notifications)
}

export function useNotificationsInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ pageParam }) => fetchNotificationsPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPages ? lastPage.pageNumber + 1 : undefined,
  })
}

export function useNotificationsList() {
  const query = useNotificationsInfiniteQuery()
  const notifications = query.data?.pages.flatMap((p) => p.items) ?? []
  const lastPage = query.data?.pages.at(-1)
  return {
    ...query,
    notifications,
    listHasNextPage: (lastPage?.pageNumber ?? 1) < (lastPage?.totalPages ?? 1),
    isListPending: query.isPending && notifications.length === 0,
    isLoadingMore: query.isFetchingNextPage,
  }
}
