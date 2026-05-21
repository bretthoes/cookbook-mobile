export interface ConfigBaseProps {
  persistNavigation: "always" | "dev" | "prod" | "never"
  catchErrors: "always" | "dev" | "prod" | "never"
  exitRoutes: string[]
  INVITE_BASE_URL: string
  SUPPORT_EMAIL: string
  GOOGLE_WEB_CLIENT_ID: string
  GOOGLE_IOS_CLIENT_ID: string
}

export interface EnvConfigProps {
  API_URL: string
  /** Sentry DSN; set via EXPO_PUBLIC_SENTRY_DSN at build time. Use CHANGEME to disable. */
  SENTRY_DSN: string
}

export type PersistNavigationConfig = ConfigBaseProps["persistNavigation"]

const BaseConfig: ConfigBaseProps = {
  // This feature is particularly useful in development mode, but
  // can be used in production as well if you prefer.
  persistNavigation: "dev",

  /**
   * Only enable if we're catching errors in the right environment
   */
  catchErrors: "always",

  /**
   * This is a list of all the route names that will exit the app if the back button
   * is pressed while in that screen. Only affects Android.
   */
  exitRoutes: ["Welcome"],

  INVITE_BASE_URL: "https://sharedcookbook.com",
  SUPPORT_EMAIL: "bretthoes@proton.me",
  GOOGLE_WEB_CLIENT_ID:
    "855003467457-e9j0dr1hl4b5uugr60e2rl310k24tb2a.apps.googleusercontent.com",
  GOOGLE_IOS_CLIENT_ID:
    "855003467457-0np16tdr82tqvulovp4mjsfmi2ulf84r.apps.googleusercontent.com",
}

export default BaseConfig
