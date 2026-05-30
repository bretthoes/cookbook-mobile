import { queryKeys } from "@/services/query/queryKeys"
import { persistQueryClient } from "@tanstack/react-query-persist-client"
import type { QueryClient } from "@tanstack/react-query"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { storage } from "@/utils/storage"

const QUERY_CACHE_KEY = "query-cache-v1"

const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value)
    },
    removeItem: (key) => {
      storage.remove(key)
    },
  },
  key: QUERY_CACHE_KEY,
})

export function setupQueryPersistence(queryClient: QueryClient) {
  const [unsubscribe] = persistQueryClient({
    queryClient,
    persister: queryPersister,
    maxAge: 1000 * 60 * 60 * 24,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // Pending/error queries must not be persisted — they reject on rehydrate (e.g. deleted recipe).
        if (query.state.status !== "success") return false
        const key = query.queryKey
        // Only cache list data; detail screens fetch fresh when opened.
        if (key[0] === queryKeys.cookbooks.all[0]) return key[1] === "list"
        if (key[0] === queryKeys.recipes.all[0]) return key[1] === "list"
        return false
      },
    },
  })
  return unsubscribe
}
