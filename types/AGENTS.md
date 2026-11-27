# types/ — agent notes

App-facing TypeScript types. Generated HTTP types stay in `services/api/generated/schema.d.ts`. This folder aliases those DTOs and holds form shapes the API does not return.

| File | Contents |
| --- | --- |
| `recipe.ts` | `RecipeDetail`, `RecipeBriefItem`, directions, ingredients. `RecipeToAdd` is the create payload. |
| `cookbook.ts` | `CookbookItem` (`CookbookBriefDto` plus required `id` and `title`). `CookbookToAdd` is the create payload. |
| `recipeDraft.ts` | Local draft stored in `uiStore`. It is not an API DTO. |
| `membership.ts`, `invitation.ts`, `notification.ts`, `auth.ts` | Domain aliases and request shapes. |
| `pagination.ts` | `PaginatedList<T>` used by list snapshots. |

When the OpenAPI spec changes, run `npm run generate:api`, then update the alias here if a screen reads the new field. Leave `schema.d.ts` unchanged by hand.

List payloads use `RecipeList`, `CookbookList`, `MembershipList`, `InvitationList`, and `NotificationList` (`PaginatedList<T>`). Create payloads are `RecipeToAdd` and `CookbookToAdd`.
