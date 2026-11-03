import { beforeEach, describe, expect, it, vi } from "vitest"
import { getSpeechRecognitionLocale } from "@/i18n/language"

const mocks = vi.hoisted(() => ({
  language: "en",
  locales: [] as { languageTag: string; regionCode: string | null }[],
}))

vi.mock("i18next", () => ({
  default: {
    get language() {
      return mocks.language
    },
  },
  changeLanguage: vi.fn(),
}))

vi.mock("expo-localization", () => ({
  getLocales: () => mocks.locales,
}))

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}))

vi.mock("@/utils/formatDate", () => ({
  loadDateFnsLocale: vi.fn(),
}))

describe("getSpeechRecognitionLocale", () => {
  beforeEach(() => {
    mocks.language = "en"
    mocks.locales = [{ languageTag: "en-US", regionCode: "US" }]
  })

  it("uses the device tag when it matches the app language and includes a region", () => {
    mocks.language = "fr"
    mocks.locales = [{ languageTag: "fr-CA", regionCode: "CA" }]

    expect(getSpeechRecognitionLocale()).toBe("fr-CA")
  })

  it("falls back to a regional default when the device tag has no region", () => {
    mocks.locales = [{ languageTag: "en", regionCode: null }]

    expect(getSpeechRecognitionLocale()).toBe("en-US")
  })

  it("falls back when the device language differs from the app language", () => {
    mocks.language = "ko"
    mocks.locales = [{ languageTag: "en-US", regionCode: "US" }]

    expect(getSpeechRecognitionLocale()).toBe("ko-KR")
  })

  it("maps each app language to a regional default", () => {
    mocks.locales = []

    mocks.language = "en"
    expect(getSpeechRecognitionLocale()).toBe("en-US")

    mocks.language = "fr"
    expect(getSpeechRecognitionLocale()).toBe("fr-FR")

    mocks.language = "ko"
    expect(getSpeechRecognitionLocale()).toBe("ko-KR")
  })
})
