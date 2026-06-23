---
name: sync-api-client
description: >-
  Regenerates the TypeScript API client from the OpenAPI specification and
  updates any mobile types, query hooks, form types, or screens affected by the
  change. Use when the SharedCookbook API spec has changed, after a DTO is
  updated in the backend, when schema.d.ts is out of date, or when the user
  mentions "generate:api", "regenerate client", or "sync the API".
---

# Syncing the API Client

## ⚠️ Breaking change assessment

**Before updating mobile code**, check whether the spec change is additive or breaking.

| Change type                                   | Impact on mobile                                                    | Action                                |
| --------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------- |
| New nullable field on a response schema       | Safe — extra JSON fields are ignored until read sites use them      | Add to `types/` and UI as needed      |
| New optional field on a request schema        | Safe — omitting it sends `null`, which the server accepts           | Add to form/types with `null` default |
| Renamed or removed field on a response schema | **Breaking** — UI silently loses data if read sites are not updated | Warn user; update all read sites      |
| Renamed or removed field on a request schema  | **Breaking** — old field name still sent; new field never sent      | Warn user; update all write sites     |
| Type change on any field                      | **Breaking** — TypeScript type errors and possible runtime crashes  | Warn user; audit all usages           |
| Previously optional field becomes required    | **Breaking** — forms that omit it will fail API validation          | Warn user; add required validation    |

If the change is breaking, tell the user before proceeding:

> ⚠️ **This spec change is breaking.** The mobile app currently [describe the current behaviour]. After this update, [describe what changes]. Make sure the backend and app are deployed together, or use a feature flag to gate the new behaviour.

## Project layout

| Path                                                       | Purpose                                           |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `../SharedCookbook/src/Web/wwwroot/api/specification.json` | Source OpenAPI spec (owned by SharedCookbook)     |
| `services/api/generated/schema.d.ts`                       | Generated TypeScript types — do not edit manually |
| `types/`                                                   | Plain TypeScript types derived from API DTOs      |
| `hooks/queries/`                                           | TanStack Query hooks for server data              |
| `stores/`                                                  | Zustand for client/session state only             |
| `services/api/wrappers/`                                   | Typed API call wrappers                           |

## Workflow

```
- [ ] Step 1: Regenerate the client
- [ ] Step 2: Identify affected mobile code
- [ ] Step 3: Update types and forms
- [ ] Step 4: Update query hooks, stores, and screens
```

---

### Step 1: Regenerate the Client

```powershell
npm run generate:api
```

This reads `specification.json` and writes `services/api/generated/schema.d.ts`.

---

### Step 2: Identify Affected Mobile Code

Compare the old and new `schema.d.ts` to find added or changed fields. Then check which of the following need updating:

| Area                                    | What to check                                             |
| --------------------------------------- | --------------------------------------------------------- |
| `types/recipe.ts` (etc.)                | DTO aliases and snapshot types                            |
| `hooks/queries/useRecipesQuery.ts`      | Query/mutation payloads and cache updates                 |
| `components/Recipe/RecipeForm.tsx`      | `RecipeFormInputs` interface, `defaultForm`, field arrays |
| `validators/recipeSchema.ts`            | Yup schema entries                                        |
| `i18n/en.ts` (+ `fr.ts`, `ko.ts`)       | Translation keys for new labels                           |
| `app/(logged-in)/recipe/add.tsx`        | `mapRecipeToFormInputs`, create payload                   |
| `app/(logged-in)/recipe/[id]/edit.tsx`  | `mapRecipeToFormInputs`, update payload                   |
| `app/(logged-in)/recipe/[id]/index.tsx` | Detail view display                                       |
| `components/Recipe/RecipeSummary.tsx`   | Summary display                                           |

---

### Step 3: Update Types and Forms

**`types/` pattern** (nullable boolean example):

```ts
export type RecipeDetail = components["schemas"]["RecipeDetailedDto"]
// or extend with explicit optional/nullable fields when needed
```

**`RecipeFormInputs` pattern**:

```ts
isVegetarian: boolean | null
```

**`defaultForm` pattern**:

```ts
isVegetarian: null,
```

**`recipeSchema` pattern**:

```ts
isVegetarian: yup.bool().nullable().default(null),
```

---

### Step 4: Update Query Hooks, Stores, and Screens

- **Server data** — update or add hooks in `hooks/queries/`; invalidate with `queryKeys` after mutations.
- **Client-only state** — update Zustand stores in `stores/` only when the change is not server-backed (drafts, selection, auth, etc.).
- **Screens/components** — follow existing patterns; use `useXQuery` / `useXMutation` for API data and `useXStore` for client state.

When in doubt, search for an existing field like `isVegetarian` and mirror the same treatment for the new field.
