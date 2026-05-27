/**
 * This file imports configuration objects from either the config.dev.js file
 * or the config.prod.js file depending on whether we are in __DEV__ or not.
 *
 * Note that we do not gitignore these files. Unlike on web servers, just because
 * these are not checked into your repo doesn't mean that they are secure.
 * In fact, you're shipping a JavaScript bundle with every
 * config variable in plain text. Anyone who downloads your app can easily
 * extract them.
 *
 * If you doubt this, just bundle your app, and then go look at the bundle and
 * search it for one of your config variable values. You'll find it there.
 *
 * Read more here: https://reactnative.dev/docs/security#storing-sensitive-info
 */
import BaseConfig, { type ConfigBaseProps, type EnvConfigProps } from "./config.base"
import ProdConfig from "./config.prod"
import DevConfig from "./config.dev"
import { Platform } from "react-native"

export type AppConfig = ConfigBaseProps & EnvConfigProps

let ExtraConfig: EnvConfigProps = ProdConfig

if (__DEV__) {
  ExtraConfig = DevConfig
}

function revenueCatApiKey(): string {
  const shared = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim() ?? ""
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS?.trim() || shared
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID?.trim() || shared
  }
  return shared
}

const Config: AppConfig = {
  ...BaseConfig,
  ...ExtraConfig,
  REVENUECAT_API_KEY: revenueCatApiKey(),
}

export default Config
