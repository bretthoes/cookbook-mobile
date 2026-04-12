import i18n from "i18next"
import type { TOptions } from "i18next"
import { TxKeyPath } from "./i18n"

/**
 * Options for `t()` / `translate()` compatible with react-i18next's typed `t`
 * (i18next's `TOptions` uses `context?: unknown`, which is not assignable).
 */
export type TranslationOptions = Omit<TOptions, "context"> & { context?: string }

/**
 * Translates text.
 * @param {TxKeyPath} key - The i18n key.
 * @param {TranslationOptions} options - The i18n options.
 * @returns {string} - The translated text.
 * @example
 * Translations:
 *
 * ```en.ts
 * {
 *  "hello": "Hello, {{name}}!"
 * }
 * ```
 *
 * Usage:
 * ```ts
 * import { translate } from "./i18n"
 *
 * translate("common:ok", { name: "world" })
 * // => "Hello world!"
 * ```
 */
export function translate(key: TxKeyPath, options?: TranslationOptions): string {
  if (i18n.isInitialized) {
    return i18n.t(key, options)
  }
  return key
}
