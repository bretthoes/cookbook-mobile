import { useLatestActivityQuery } from "@/hooks/queries/useLatestActivityQuery"
import { useAuthStore } from "@/stores/authStore"
import { feedLastSeenKey, isUnseenActivity } from "@/utils/activityFeed"
import { storage } from "@/utils/storage"
import { useEffect } from "react"
import { useMMKVString } from "react-native-mmkv"

/** Whether someone else did something since the Feed tab was last opened. */
export function useFeedHasUnseen(activeTabName: string): boolean {
  const userId = useAuthStore((s) => s.userId)
  const [lastSeenAt] = useMMKVString(feedLastSeenKey(userId), storage)
  const { data: latest, refetch } = useLatestActivityQuery()

  useEffect(() => {
    void refetch()
  }, [activeTabName, refetch])

  return isUnseenActivity(latest, lastSeenAt)
}

/** Opening the feed marks everything up to now as seen. Returns the marker from before this visit. */
export function markFeedSeen(userId: string | undefined): string | undefined {
  const key = feedLastSeenKey(userId)
  const previous = storage.getString(key)
  storage.set(key, new Date().toISOString())
  return previous
}
