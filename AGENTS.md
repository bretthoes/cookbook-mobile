# cookbook-mobile — agent notes

Expo (dev client) + React Native app using **expo-router** file-based routing. Talks to the [SharedCookbook](https://github.com/bretthoes/SharedCookbook) backend via OpenAPI-typed `openapi-fetch` client.

## Repo map

| Area                 | Path                   | Notes                                                                        |
| -------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| Screens / routes     | `app/`                 | expo-router — see `app/AGENTS.md`                                            |
| Reusable UI          | `components/`          | see `components/AGENTS.md`                                                   |
| Client state         | `stores/`              | Zustand — see `stores/AGENTS.md`                                             |
| Hooks                | `hooks/`               | Screen hooks and TanStack Query — see `hooks/AGENTS.md`                      |
| Query cache          | `services/query/`      | Keys, invalidation, persistence — see `services/query/AGENTS.md`             |
| Helpers              | `utils/`               | Pure helpers and MMKV — see `utils/AGENTS.md`                                |
| Types                | `types/`               | App-facing aliases over generated DTOs — see `types/AGENTS.md`               |
| Copy                 | `i18n/`                | en / fr / ko — see `i18n/AGENTS.md`                                          |
| Theme                | `theme/`               | Light and dark tokens — see `theme/AGENTS.md`                                |
| API layer            | `services/api/`        | OpenAPI client — see `services/api/AGENTS.md` and `services/api/README.md`   |
| Environment config   | `config/`              | `config.dev.ts` / `config.prod.ts` merged in `config/index.ts` via `__DEV__` |
| Native / Expo config | `app.json`, `eas.json` | EAS build profiles (`development`, `preview`, `production`)                  |

## Prerequisites

- **Node.js** >= 22.13 (`package.json` `engines`).
- **npm** — repo uses `package-lock.json`; use `npm ci` in CI and `npm install` locally.

## CI

GitHub Actions (`.github/workflows/ci.yml`) on push/PR to `master` and `dev`:

- GitVersion (`.github/GitVersion.yml`, same branching rules as SharedCookbook)
- `npm test` (Vitest, includes unit tests), `npm run lint`, `npm run check:i18n` (locale key parity)

No EAS/release step in CI; store builds stay manual via EAS (`npm run deploy:ios:prod`, `npm run deploy:android:prod`).

## RevenueCat (subscriptions)

Optional keys via Expo env (local: `.env.local`, CI/TestFlight: [EAS env vars](https://docs.expo.dev/eas/environment-variables/)):

- `EXPO_PUBLIC_REVENUECAT_API_KEY` — Test Store `test_…` for local dev; or shared fallback
- `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` / `_ANDROID` — `appl_…` / `goog_…` for store builds (never `test_…` on TestFlight)

Dashboard: products `monthly` / `yearly`, entitlement `pro`. After upgrading `react-native-purchases`, rebuild the dev client (`npm run ios` / `android`).

## Install and dev server

```bash
npm install
npm start
```

Use the dev client / simulator options from the Expo CLI. Platform shortcuts:

```bash
npm run android
npm run ios
npm run web
```

## Backend URL (development)

`config/config.dev.ts` sets `API_URL` to `http://<host>:<port>/api`. The port is **5055** when the bundler host is macOS, because AirPlay Receiver already listens on **5000** and returns 403. Windows keeps **5000**.

- **iOS simulator**: `127.0.0.1` (same machine as the API).
- **Android emulator**: `10.0.2.2` (host loopback from the emulator).

Run SharedCookbook from `SharedCookbook/src/Web` with `dotnet watch run`. On macOS, development HTTP is `http://localhost:5055`. On Windows it stays `http://localhost:5000` (`launchSettings.json`). Dev uses HTTP, not HTTPS.

For a physical device, you will need a reachable host/IP (not documented here by default).

## OpenAPI codegen

When the backend contract changes, regenerate types from the sibling checkout path:

```bash
npm run generate:api
```

This reads `../SharedCookbook/src/Web/wwwroot/api/specification.json` and writes `services/api/generated/schema.d.ts`. Both repos should live as siblings (e.g. `git/SharedCookbook` and `git/cookbook-mobile`).

After regeneration, update `services/api/wrappers/*.ts` and `services/api/index.ts` if new endpoints need app-facing methods.

## Lint, test, and format

```bash
npm test
npm run lint
npm run check:i18n
npm run format:check
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
