# stores/ — agent notes

Zustand stores for **client** and **session** state. Server lists and details use TanStack Query (`hooks/queries/`).

| Store        | File                   | Persist key | Role                                                |
| ------------ | ---------------------- | ----------- | --------------------------------------------------- |
| Auth         | `authStore.ts`         | `auth-v1`   | Login, tokens (SecureStore), display name           |
| UI           | `uiStore.ts`           | `ui-v1`     | Favorites, selected cookbook, drafts, import limits |
| Membership   | `membershipStore.ts`   | —           | Members list for current cookbook                   |
| Invitation   | `invitationStore.ts`   | —           | Pending invites                                     |
| Subscription | `subscriptionStore.ts` | —           | RevenueCat `isPro`                                  |

Bootstrap: `setupApp.ts` (legacy `root-v1` snapshot migration from the old MobX-State-Tree persist key, API callbacks, RevenueCat). Root layout uses `hooks/useAppInit.ts`.

Use narrow selectors: `useAuthStore((s) => s.authEmail)` — avoid subscribing to the whole store.
