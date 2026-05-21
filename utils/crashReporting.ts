import * as Sentry from "@sentry/react-native"
import type { NavigationContainerRef, ParamListBase } from "@react-navigation/native"
import Config from "@/config"

const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
})

function isSentryEnabled(): boolean {
  const dsn = Config.SENTRY_DSN
  return Boolean(dsn && dsn !== "CHANGEME")
}

/**
 * Initialize Sentry. Call once at app startup (before the root component renders).
 */
export const initCrashReporting = (): void => {
  if (!isSentryEnabled()) {
    return
  }

  Sentry.init({
    dsn: Config.SENTRY_DSN,
    debug: __DEV__,
    enabled: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,
    integrations: [navigationIntegration],
    enableNative: true,
    enableNativeCrashHandling: true,
    enableAutoSessionTracking: true,
  })
}

export function registerNavigationContainer(
  containerRef: NavigationContainerRef<ParamListBase> | null,
): void {
  if (!isSentryEnabled() || !containerRef) {
    return
  }

  navigationIntegration.registerNavigationContainer(containerRef)
}

/**
 * Error classifications used to sort errors on error reporting services.
 */
export enum ErrorType {
  /**
   * An error that would normally cause a red screen in dev
   * and force the user to sign out and restart.
   */
  FATAL = "Fatal",
  /**
   * An error caught by try/catch where defined using Reactotron.tron.error.
   */
  HANDLED = "Handled",
}

/**
 * Manually report a handled error.
 */
export const reportCrash = (
  error: Error,
  type: ErrorType = ErrorType.FATAL,
  componentStack?: string | null,
): void => {
  if (__DEV__) {
    const message = error.message || "Unknown"
    console.error(error)
    console.log(message, type)
  }

  if (!isSentryEnabled()) {
    return
  }

  Sentry.withScope((scope) => {
    scope.setTag("errorType", type)
    if (componentStack) {
      scope.setContext("react", { componentStack })
    }
    Sentry.captureException(error)
  })
}

export { Sentry }
