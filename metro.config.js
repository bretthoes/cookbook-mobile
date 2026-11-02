const os = require("os")
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

// macOS AirPlay Receiver binds port 5000. Set this before Expo inlines EXPO_PUBLIC_*
// so every bundle produced on a Mac (iOS, Android, and web) calls 5055.
if (os.platform() === "darwin" && !process.env.EXPO_PUBLIC_DEV_API_PORT) {
  process.env.EXPO_PUBLIC_DEV_API_PORT = "5055"
}

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = getSentryExpoConfig(__dirname)
