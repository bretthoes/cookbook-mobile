/**
 * Dev-only overrides (merged on top of config.base.ts).
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import type { EnvConfigProps } from "./config.base"
import { Platform } from "react-native"

const DEV_API_PORT = 5000
// Android emulator maps 10.0.2.2 → host machine. iOS simulator uses loopback like a normal Mac process.
const DEV_API_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1"

const DevConfig: EnvConfigProps = {
  API_URL: `http://${DEV_API_HOST}:${DEV_API_PORT}/api`,
}

export default DevConfig
