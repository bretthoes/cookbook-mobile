# types/ — agent notes

App-facing TypeScript types. Generated HTTP types stay in `services/api/generated/schema.d.ts`. This folder aliases those DTOs and holds form shapes the API does not return.

| File | Contents |
| --- | --- |
| `recipe.ts` | `RecipeDetail`, `RecipeBriefItem`, directions, ingredients. `RecipeToAddSnapshotIn` is the create payload. |
| `cookbook.ts` | `CookbookItem` (`CookbookBriefDto` plus required `id` and `title`). `CookbookToAdd` is the create payload. |
| `recipeDraft.ts` | Local draft stored in `uiStore`. It is not an API DTO. |
| `membership.ts`, `invitation.ts`, `notification.ts`, `auth.ts` | Domain aliases and request shapes. |
| `pagination.ts` | `PaginatedList<T>` used by list snapshots. |

When the OpenAPI spec changes, run `npm run generate:api`, then update the alias here if a screen reads the new field. Leave `schema.d.ts` unchanged by hand.

`RecipeSnapshotIn` and `CookbookSnapshotIn` are names left from the MobX-State-Tree models. They are the same types as `RecipeDetail` and `CookbookItem`. New code can use those names.
