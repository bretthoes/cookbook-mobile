# services/query/ — agent notes

TanStack Query client, keys, invalidation, and MMKV persistence. The hooks that call into this folder live in `hooks/queries/`.

| File | Role |
| --- | --- |
| `queryClient.ts` | Singleton. `staleTime` 30s, `gcTime` 24h, `retry` 1. Tests replace it with `setQueryClient`. |
| `QueryProvider.tsx` | Provides the client and starts persistence. Mounted from `app/_layout.tsx`. |
| `queryKeys.ts` | Every cache key. Add a key here when adding a query. |
| `invalidateQueries.ts` | List invalidation uses predicates so a list refresh leaves detail queries alone. |
| `unwrapApiResult.ts` | Returns the ok payload, or throws `ApiQueryError` carrying `problem.kind`. |
| `setupQueryPersistence.ts` | Writes successful cookbook and recipe list queries to MMKV (`query-cache-v1`) for 24h. |

Key shape:

- Cookbooks list: `["cookbooks", "list"]`
- Recipes list: `["recipes", "list", cookbookId, search]`
- Recipe detail: `["recipes", "detail", recipeId]`
- Notifications list / latest: `["notifications", "list"]` and `["notifications", "latest"]`

Persistence keeps successful list queries only. Detail queries are fetched again when the screen opens. Pending and error queries are left out so a deleted recipe is not restored as a failure.

A new list or detail needs a key, a hook, and an invalidation call from every mutation that changes that data.
