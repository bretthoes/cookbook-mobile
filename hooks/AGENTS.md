# hooks/ — agent notes

React hooks for screen behavior. Cached server state is TanStack Query under `hooks/queries/`. Keys, invalidation, and persistence live in `services/query/` — see `services/query/AGENTS.md`.

Pure helpers stay in `utils/`. `useHeader` is the exception: the implementation is `hooks/useHeader.tsx`, and screens import the re-export at `@/utils/useHeader`.

## Feature hooks

| Hook | Role |
| --- | --- |
| `useAppInit` | Calls `setupApp()` once from the root layout. `ready` flips after SecureStore sync, API callbacks, and RevenueCat. |
| `useHeader` | Sets the React Navigation header to `components/Header`. |
| `useActionSheet` | Action sheet. Applies `androidActionSheetSafeArea` on Android. |
| `useSelectedCookbook` | Current cookbook from `uiStore`. |
| `useManualRefresh` | Pull-to-refresh around a query refetch. |
| `useInFlightAction` | Ignores a second press while an async action is running. |
| `usePaywall` | RevenueCat offerings and purchase. |
| `useAppleSignIn`, `useGoogleSignIn`, `useFacebookSignIn`, `useSsoAuth` | SSO. `useSsoAuth` runs the shared post-login path. |
| `useEmailVerificationPolling` | Polls until the account is verified. |
| `usePrintRecipe` | Print or share a recipe. |
| `useRecipeMadeCooldown` | UI for the 12-hour cooldown in `utils/recipeMadeCooldown.ts`. |

## Query hooks

One file per resource: `useCookbooksQuery.ts`, `useRecipesQuery.ts`, `useNotificationsQuery.ts`, `useLatestActivityQuery.ts`.

1. Call `api` or a function in `services/api/wrappers/`.
2. Pass the result through `unwrapApiResult`. A non-ok result throws `ApiQueryError`.
3. Read the key from `queryKeys` in `services/query/queryKeys.ts`. Add the key there before adding the hook.
4. After a mutation, call the matching helper in `services/query/invalidateQueries.ts` (`invalidateCookbookLists`, `invalidateRecipeLists`, `invalidateRecipeListsForCookbook`).
5. List screens use the `useXList` wrapper. It flattens infinite-query pages and exposes `isListPending`, `isListEmpty`, and `isLoadingMore`.

Detail queries set `enabled: !!id` so an empty route param does not fetch.

Recipe-import loading delay and the weekly import limit stay in the mutation (`utils/minimumLoadingDelay.ts`, `utils/recipeDraftHelpers.ts`), not on the query client.
