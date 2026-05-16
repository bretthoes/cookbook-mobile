/**
 * These are configuration settings for the dev environment.
 *
 * Do not include API secrets in this file or anywhere in your JS.
 *
 * https://reactnative.dev/docs/security#storing-sensitive-info
 */
import { Platform } from "react-native"

const DEV_API_PORT = 5000
// Android emulator maps 10.0.2.2 → host machine. iOS simulator uses loopback like a normal Mac process.
const DEV_API_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1"

export default {
  API_URL: `http://${DEV_API_HOST}:${DEV_API_PORT}/api`,
  INVITE_BASE_URL: "CHANGEME",
  SUPPORT_EMAIL: "CHANGEME",
  GOOGLE_WEB_CLIENT_ID: "855003467457-e9j0dr1hl4b5uugr60e2rl310k24tb2a.apps.googleusercontent.com",
  GOOGLE_IOS_CLIENT_ID: "855003467457-0np16tdr82tqvulovp4mjsfmi2ulf84r.apps.googleusercontent.com",
}
