import type { TxKeyPath } from "@/i18n"
import type { NotificationItem } from "@/types/notification"
import { differenceInCalendarDays } from "date-fns/differenceInCalendarDays"
import { parseISO } from "date-fns/parseISO"

const LAST_SEEN_KEY_PREFIX = "feed.lastSeenAt"

export type ActivityFeedBucket = "today" | "yesterday" | "thisWeek" | "earlier"

const BUCKET_ORDER: readonly ActivityFeedBucket[] = ["today", "yesterday", "thisWeek", "earlier"]

const BUCKET_TX: Record<ActivityFeedBucket, TxKeyPath> = {
  today: "feedScreen:today",
  yesterday: "feedScreen:yesterday",
  thisWeek: "feedScreen:thisWeek",
  earlier: "feedScreen:earlier",
}

export type ActivityFeedSection = {
  bucket: ActivityFeedBucket
  titleTx: TxKeyPath
  data: NotificationItem[]
}

/** Per-account so one person opening the feed does not clear the dot for the next account. */
export function feedLastSeenKey(userId: string | undefined): string {
  const owner = userId?.trim()
  return owner ? `${LAST_SEEN_KEY_PREFIX}.${owner}` : LAST_SEEN_KEY_PREFIX
}

export function activityFeedBucket(created: string, now: Date): ActivityFeedBucket {
  const days = differenceInCalendarDays(now, parseISO(created))
  if (days <= 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return "thisWeek"
  return "earlier"
}

/** Keeps the API's newest-first order inside each section and drops empty sections. */
export function groupActivityFeed(
  items: readonly NotificationItem[],
  now: Date,
): ActivityFeedSection[] {
  const byBucket = new Map<ActivityFeedBucket, NotificationItem[]>()
  for (const item of items) {
    const bucket = activityFeedBucket(item.created, now)
    const list = byBucket.get(bucket)
    if (list) list.push(item)
    else byBucket.set(bucket, [item])
  }
  return BUCKET_ORDER.filter((bucket) => byBucket.has(bucket)).map((bucket) => ({
    bucket,
    titleTx: BUCKET_TX[bucket],
    data: byBucket.get(bucket) ?? [],
  }))
}

/** Your own actions never count as new. */
export function isUnseenActivity(
  item: Pick<NotificationItem, "created" | "actorIsCurrentUser"> | null | undefined,
  lastSeenAt: string | undefined,
): boolean {
  if (!item || item.actorIsCurrentUser) return false
  if (!lastSeenAt) return true
  return parseISO(item.created).getTime() > parseISO(lastSeenAt).getTime()
}
