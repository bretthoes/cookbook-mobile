# models/ — agent notes

App state uses **MobX-State-Tree (MST)** with **mobx-react-lite** `observer()` on screens that read stores.

## RootStore

`RootStore.ts` composes domain stores:

| Store | File | Responsibility |
|-------|------|----------------|
| `authenticationStore` | `AuthenticationStore.ts` | Auth token, email, display name, login/logout/SSO |
| `cookbookStore` | `CookbookStore.ts` | Cookbook list, selection, favorites |
| `recipeStore` | `Recipe/RecipeStore.ts` | Recipes, drafts, imports, weekly limits |
| `membershipStore` | `MembershipStore.ts` | Cookbook members |
| `invitationStore` | `InvitationStore.ts` | Pending invitations |
| `episodeStore` | `EpisodeStore.ts` | Legacy Ignite demo data (unused in production flows) |

Access stores in screens:

```tsx
import { observer } from "mobx-react-lite"
import { useStores } from "@/models/helpers/useStores"

export default observer(function MyScreen() {
  const { cookbookStore, recipeStore } = useStores()
  // ...
})
```

## Model vs store

| Kind | Naming | Role |
|------|--------|------|
| **Model** | `Cookbook.ts` → `CookbookModel` | Single entity shape (props, views, entity actions) |
| **Store** | `CookbookStore.ts` → `CookbookStoreModel` | Collection + API `flow` actions (`fetch`, `create`, `update`) |

Stores hold arrays/references to models and call `api.*` from `@/services/api`. Models mirror API DTO fields as MST `types.*` props.

## Common patterns

### `withSetPropAction`

Add `.actions(withSetPropAction)` on models/stores, then use `self.setProp("field", value)` instead of many one-off setters.

### Async API calls

Use MST `flow(function* () { … })` in store actions. Check `response.kind === "ok"` from the API layer before updating state.

```ts
fetch: flow(function* () {
  const response = yield api.getCookbooks()
  if (response.kind === "ok") {
    self.setProp("cookbooks", response.cookbooks.items)
  }
}),
```

### Types

Export `Instance`, `SnapshotIn`, `SnapshotOut` from model files for typing create/update payloads.

### Persistence

`helpers/setupRootStore.ts` rehydrates the full `RootStore` from AsyncStorage (`root-v1` key) and wires `api.setSessionExpiredCallback` to `authenticationStore.logout()`. Auth tokens are also stored in **expo-secure-store** separately.

Do not persist sensitive data in MST snapshots beyond what is already stored.

## API alignment

MST models should reflect OpenAPI DTOs in `services/api/generated/schema.d.ts`. When the backend contract changes:

1. Run `pnpm run generate:api` (see root `AGENTS.md`).
2. Update MST props, form types, validators, and screens — see `.cursor/skills/sync-api-client/SKILL.md` for the full checklist.

**Nullable API fields** → `types.maybeNull(types.boolean)` (or string, number, etc.).

**New response fields** are safe to add; MST ignores unknown JSON keys.

**Renamed/removed fields** are breaking — update all read/write sites.

## Recipe subtree

`models/Recipe/` contains the largest models:

| File | Purpose |
|------|---------|
| `Recipe.ts` | Full recipe entity |
| `RecipeToAdd.ts` | Create/update payload |
| `RecipeDraft.ts` | Local draft persistence |
| `RecipeStore.ts` | Fetch, save, import, draft helpers |
| `IngredientSection.ts`, `RecipeIngredient.ts`, `RecipeDirection.ts`, `RecipeImage.ts` | Nested recipe parts |

`RecipeStore` exports helpers like `getCurrentWeekKey()` and `WEEKLY_IMPORT_LIMIT` used by import screens.

## Adding a new domain store

1. Create `MyEntity.ts` (model) and `MyEntityStore.ts` (store with `flow` actions).
2. Register on `RootStoreModel` in `RootStore.ts`.
3. Use `observer()` + `useStores()` in screens.
4. Add API wrapper methods in `services/api/wrappers/` if new endpoints are needed.

## Related docs

| Topic | Location |
|-------|----------|
| Screens / routing | `app/AGENTS.md` |
| API layer | `services/api/README.md` |
| Contract sync workflow | `.cursor/skills/sync-api-client/SKILL.md` |
