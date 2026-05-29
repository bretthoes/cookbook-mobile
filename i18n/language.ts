import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n, { changeLanguage } from "i18next"
import { loadDateFnsLocale } from "@/utils/formatDate"

export const LANGUAGE_STORAGE_KEY = "language"

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "ko", name: "한국어" },
] as const

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"]

const supportedCodes = SUPPORTED_LANGUAGES.map((l) => l.code)

export function normalizeLanguageCode(
  tag: string | undefined | null,
): SupportedLanguageCode | null {
  if (!tag) return null
  const primary = tag.split("-")[0]
  return supportedCodes.includes(primary as SupportedLanguageCode)
    ? (primary as SupportedLanguageCode)
    : null
}

export function getActiveLanguageCode(): SupportedLanguageCode {
  return normalizeLanguageCode(i18n.language) ?? "en"
}

export async function getStoredLanguageCode(): Promise<SupportedLanguageCode | null> {
  const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
  return normalizeLanguageCode(stored)
}

export async function setAppLanguage(code: SupportedLanguageCode): Promise<void> {
  await changeLanguage(code)
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, code)
  loadDateFnsLocale()
}
