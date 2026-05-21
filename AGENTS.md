# cookbook-mobile — agent notes

Expo (dev client) + React Native app using **expo-router** file-based routing. Talks to the [SharedCookbook](https://github.com/bretthoes/SharedCookbook) backend via OpenAPI-typed `openapi-fetch` client.

## Repo map

| Area                 | Path                   | Notes                                                                        |
| -------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| Screens / routes     | `app/`                 | expo-router — see `app/AGENTS.md`                                            |
| State (MST)          | `models/`              | MobX-State-Tree stores — see `models/AGENTS.md`                              |
| API layer            | `services/api/`        | OpenAPI client — see `services/api/AGENTS.md` and `services/api/README.md`   |
| Environment config   | `config/`              | `config.dev.ts` / `config.prod.ts` merged in `config/index.ts` via `__DEV__` |
| Native / Expo config | `app.json`, `eas.json` | EAS build profiles (`development`, `preview`, `production`)                  |

## Prerequisites

- **Node.js** >= 20 (`package.json` `engines`).
- **pnpm** — repo uses `packageManager: pnpm@9.x` and `pnpm-lock.yaml`; prefer pnpm over npm for installs.

## Install and dev server

```bash
pnpm install
pnpm start
```

Use the dev client / simulator options from the Expo CLI. Platform shortcuts:

```bash
pnpm run android
pnpm run ios
pnpm web
```

## Backend URL (development)

`config/config.dev.ts` sets `API_URL` to `http://<host>:5000/api`:

- **iOS simulator**: `127.0.0.1` (same machine as the API).
- **Android emulator**: `10.0.2.2` (host loopback from the emulator).

Run SharedCookbook from `SharedCookbook/src/Web` with `dotnet watch run` so **HTTP** is available on port **5000** (see that repo’s `launchSettings.json`). Dev uses HTTP, not HTTPS.

For a physical device, you will need a reachable host/IP (not documented here by default).

## OpenAPI codegen

When the backend contract changes, regenerate types from the sibling checkout path:

```bash
pnpm run generate:api
```

This reads `../SharedCookbook/src/Web/wwwroot/api/specification.json` and writes `services/api/generated/schema.d.ts`. Both repos should live as siblings (e.g. `git/SharedCookbook` and `git/cookbook-mobile`).

After regeneration, update `services/api/wrappers/*.ts` and `services/api/index.ts` if new endpoints need app-facing methods.

## Lint and format

```bash
pnpm run lint
pnpm run format:check
```

## Crash reporting (Sentry)

Production builds report to Sentry when configured:

1. Create a Sentry project and copy the **DSN**.
2. Set EAS environment variables for the `production` profile (Expo dashboard or CLI):
   - `EXPO_PUBLIC_SENTRY_DSN` — project DSN
   - `SENTRY_AUTH_TOKEN` — org auth token (source maps; keep secret)
   - `SENTRY_ORG` — organization slug
   - `SENTRY_PROJECT` — project slug
3. Rebuild with `eas build --platform ios --profile production` so symbols upload.

Init lives in `utils/crashReporting.ts`; root layout calls it from `app/_layout.tsx`.
