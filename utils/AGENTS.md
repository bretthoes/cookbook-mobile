# utils/ — agent notes

Pure helpers and a few shared hooks. Files are flat: import `@/utils/recipeFormMappers`, not a barrel. The only subdirectory with an entry point is `storage/`.

Server data belongs in `hooks/queries/` and `services/query/`. Screen flows belong in `hooks/`. Views belong in `components/`.

## Where new code goes

| Kind of code | Location |
| --- | --- |
| Pure function, formatter, permission check, form mapper | `utils/<name>.ts` |
| Hook that owns a screen flow (auth, paywall, refresh, init) | `hooks/` |
| Cached server data | `hooks/queries/` and a key in `services/query/queryKeys.ts` |
| Reusable view | `components/` |

Colocate Vitest tests as `utils/<name>.test.ts`.

`useHeader.tsx` re-exports `@/hooks/useHeader`. Screens import `@/utils/useHeader`. Keep the implementation in `hooks/useHeader.tsx`. `useIsMounted` and `useSafeAreaInsetsStyle` already live here; new feature hooks go in `hooks/`.

## Storage

`storage/` is MMKV (`load`, `save`, `loadString`, `saveString`, `remove`). The theme override and the TanStack list cache (`query-cache-v1` in `services/query/setupQueryPersistence.ts`) use it.

Auth tokens, email, and password use `expo-secure-store` in `stores/authStore.ts`. Keep secrets there.

The language preference uses AsyncStorage (`i18n/language.ts`, key `language`), separate from MMKV.

## Files

| Area | Files | What they own |
| --- | --- | --- |
| Recipes | `recipeFormMappers.ts`, `recipeDraftHelpers.ts`, `recipeIngredientSections.ts`, `recipeMadeCooldown.ts`, `hasMeaningfulText.ts` | Form ↔ recipe DTO mapping. Drafts skip empty placeholder titles. Caps are `MAX_INGREDIENT_SECTIONS` (20) and `MAX_INGREDIENTS_TOTAL` (40). `WEEKLY_IMPORT_LIMIT` is 5. "I made this" cooldown is 12 hours in MMKV. |
| Cookbooks | `cookbookList.ts`, `cookbookLabels.ts`, `cookbookImages.ts` | Title sort, member and recipe count labels, bundled placeholder covers keyed by cookbook id. |
| Invitations | `invitations.ts`, `invitationFormat.ts` | Invite URL, email check, sender / time-ago / message text. |
| Membership | `membershipTier.ts` | Tiers are numbers: Viewer 0, Contributor 1, Admin 2, Owner 3. Permission helpers (`canManageMembers`, `canEditAnyRecipe`, `assignableTiers`) stay here. |
| Images | `imageUploadLimits.ts`, `getImageUploadErrorMessage.ts` | Max upload is 10 MB. Map an upload failure to a `TxKeyPath`. |
| Activity | `activityFeedMessage.ts`, `formatActivityTimeAgo.ts` | Notification `actionType` → `TxKeyPath` and interpolation options. |
| Dates | `formatDate.ts` | date-fns formatter. `loadDateFnsLocale()` follows the active app language. Import `date-fns/<function>` so the whole library stays out of the bundle. |
| Errors | `mapApiProblemToTxKey.ts` | `GeneralApiProblem["kind"]` → an `errors:*` key. |
| Layout | `useSafeAreaInsetsStyle.ts`, `androidActionSheetSafeArea.ts` | Safe-area edges, including `start` and `end`. Android action-sheet inset so the sheet clears the system nav bar. |
| Routing | `routeParams.ts` | expo-router params may be `string` or `string[]`. `normalizeRouteParam` returns one string. |
| Startup | `crashReporting.ts`, `minimumLoadingDelay.ts`, `delay.ts`, `ignoreWarnings.ts`, `openLinkInBrowser.ts`, `hasValidStringProp.ts` | Sentry init from `app/_layout.tsx` (no-op when `SENTRY_DSN` is missing or `CHANGEME`). Import flows wait `RECIPE_IMPORT_MIN_LOADING_MS` so the loading screen does not flash. |
| Subscription | `subscription/pricing.ts`, `resolveRevenueCatAppUserId.ts` | Parse store price strings and annual savings. Resolve the RevenueCat app user id before `Purchases.logIn`. |
