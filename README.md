# cookbook-mobile

Expo (React Native) client for [SharedCookbook](https://github.com/bretthoes/SharedCookbook). Uses **expo-router** for navigation.

## Architecture

| Layer        | Location         | Technology                           |
| ------------ | ---------------- | ------------------------------------ |
| Server state | `hooks/queries/` | TanStack Query                       |
| Client state | `stores/`        | Zustand                              |
| Types        | `types/`         | Plain TypeScript (from OpenAPI DTOs) |
| API          | `services/api/`  | openapi-fetch                        |

See **[AGENTS.md](./AGENTS.md)** for setup, backend URL, CI, and repo layout.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm start
   ```

Use the dev client / simulator options from the Expo CLI:

```bash
npm run android
npm run ios
```

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
