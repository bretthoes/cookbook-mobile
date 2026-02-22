# API Layer

This directory contains the API layer for the cookbook-mobile app, built on OpenAPI/Swagger code generation.

## Structure

- **`generated/schema.d.ts`** — TypeScript types generated from the OpenAPI spec. Do not edit.
- **`client.ts`** — openapi-fetch client with auth middleware, token refresh, and session expiry handling.
- **`fetchWithTimeout.ts`** — Custom fetch wrapper with configurable timeout.
- **`apiProblem.ts`** — Error mapping (`GeneralApiProblem`, `getGeneralApiProblemFromResponse`).
- **`toApiResult.ts`** — Helpers for mapping responses to `{ kind: "ok" } | GeneralApiProblem`.
- **`wrappers/`** — Thin wrappers per domain (cookbooks, recipes, memberships, invitations, users, images).
- **`index.ts`** — `Api` class and `api` singleton; delegates to wrappers.

## Regenerating Types

When the backend OpenAPI spec changes:

```bash
npm run generate:api
```

This reads from `../SharedCookbook/src/Web/wwwroot/api/specification.json` and writes to `services/api/generated/schema.d.ts`.

## Adding a New Endpoint

1. Update the OpenAPI spec in the SharedCookbook backend (or ensure the spec is up to date).
2. Run `npm run generate:api`.
3. Add a wrapper method in the appropriate `wrappers/*.ts` file.
4. Expose the method on the `Api` class in `index.ts`.

## Auth and Session Expiry

- **Protected endpoints**: Auth header is injected automatically via the client's auth middleware.
- **Unprotected endpoints**: `/api/Users/login`, `/api/Users/register`, `/api/Users/resendConfirmationEmail`, `/api/Users/forgotPassword`, `/api/Users/resetPassword`, `/api/Users/confirmEmail`.
- **401 handling**: Client attempts token refresh via `POST /api/Users/refresh`, then retries the original request.
- **Session expiry**: Call `api.setSessionExpiredCallback(callback)` during app setup (e.g. in `setupRootStore`). The callback is invoked when refresh fails.

## Multipart Endpoints

`uploadImage` and `extractRecipeFromImage` use FormData with `bodySerializer` for multipart uploads. The spec uses `file` for single-file and `files` for multi-file; verify backend expects the key used.
