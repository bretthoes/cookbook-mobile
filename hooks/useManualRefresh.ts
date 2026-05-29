import { delay } from "@/utils/delay"
import { useCallback, useState } from "react"

const DEFAULT_REFRESH_DELAY_MS = 750

/**
 * Pull-to-refresh helper that runs one or more async tasks with a minimum delay
 * so the refresh indicator is visible long enough for UX.
 */
export function useManualRefresh(
  refreshFn: () => Promise<unknown>,
  options?: { delayMs?: number },
) {
  const [refreshing, setRefreshing] = useState(false)
  const delayMs = options?.delayMs ?? DEFAULT_REFRESH_DELAY_MS

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refreshFn(), delay(delayMs)])
    } finally {
      setRefreshing(false)
    }
  }, [refreshFn, delayMs])

  return { refreshing, onRefresh }
}
