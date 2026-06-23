# services/api/ — agent notes

OpenAPI-typed HTTP client for SharedCookbook. **Full reference: [`README.md`](./README.md).**

## Quick reference

| File                              | Purpose                                              |
| --------------------------------- | ---------------------------------------------------- |
| `generated/schema.d.ts`           | Generated types — **do not edit**                    |
| `client.ts`                       | openapi-fetch client, auth middleware, token refresh |
| `wrappers/*.ts`                   | Per-domain typed methods                             |
| `index.ts`                        | `Api` class / `api` singleton                        |
| `toApiResult.ts`, `apiProblem.ts` | Response → `{ kind: "ok", … } \| GeneralApiProblem`  |

## Regenerate types

```bash
npm run generate:api
```

Reads `../SharedCookbook/src/Web/wwwroot/api/specification.json`, writes `generated/schema.d.ts`.

## Add a new endpoint

1. Update backend OpenAPI spec and regenerate (above).
2. Add method in the appropriate `wrappers/*.ts`.
3. Expose on `Api` in `index.ts`.

## After contract changes

Update `types/`, query hooks, forms, validators, and screens — see `.cursor/skills/sync-api-client/SKILL.md`.

## Auth

- Protected routes: auth header injected automatically.
- 401: client refreshes via `POST /api/Users/refresh`, then retries.
- Session expiry: `api.setSessionExpiredCallback` → `useAuthStore.getState().logout()` (wired in `stores/setupApp.ts`).
