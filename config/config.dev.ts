/**
 * Dev-only overrides (merged on top of config.base.ts).
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import type { EnvConfigProps } from "./config.base"
import { Platform } from "react-native"

// macOS AirPlay Receiver (Control Center) listens on TCP 5000 and returns 403,
// which this app reports as a forbidden login. metro.config.js sets
// EXPO_PUBLIC_DEV_API_PORT=5055 when the bundler host is a Mac, so iOS,
// Android, and web on that machine all use 5055. Windows keeps 5000.
const DEV_API_PORT =
  process.env.EXPO_PUBLIC_DEV_API_PORT ??
  (Platform.OS === "ios" || process.platform === "darwin" ? "5055" : "5000")
// Android emulator maps 10.0.2.2 → host machine. iOS simulator uses loopback like a normal Mac process.
const DEV_API_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1"

const DevConfig: EnvConfigProps = {
  API_URL: `http://${DEV_API_HOST}:${DEV_API_PORT}/api`,
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN ?? "",
  REVENUECAT_API_KEY: "",
}

export default DevConfig
