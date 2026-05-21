/**
 * Production-only overrides (merged on top of config.base.ts).
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import type { EnvConfigProps } from "./config.base"

const ProdConfig: EnvConfigProps = {
  API_URL: "https://sharedcookbook-api.fly.dev/api",
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
}

export default ProdConfig
