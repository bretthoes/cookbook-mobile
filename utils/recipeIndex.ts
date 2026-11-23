import type { SupportedLanguageCode } from "@/i18n/language"

const HANGUL_SYLLABLE_BASE = 0xac00
const HANGUL_SYLLABLE_LAST = 0xd7a3
const CHOSEONG_JAMO_BASE = 0x1100

/** Compatibility jamo, in choseong order. Tense consonants fold into the basic one. */
const CHOSEONG = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
const CHOSEONG_FOLDED = "ㄱㄱㄴㄷㄷㄹㅁㅂㅂㅅㅅㅇㅈㅈㅊㅋㅌㅍㅎ"
const HANGUL_SECTION_ORDER = [
  "ㄱ",
  "ㄴ",
  "ㄷ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅅ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
]

const OTHER_SECTION = "#"

export type RecipeIndexItem = {
  id: string
  title: string
}

export type RecipeIndexSection<T extends RecipeIndexItem> = {
  title: string
  data: T[]
}

function foldedChoseong(index: number): string | null {
  return CHOSEONG_FOLDED[index] ?? null
}

function hangulSection(character: string): string | null {
  const code = character.codePointAt(0)
  if (code == null) return null

  if (code >= HANGUL_SYLLABLE_BASE && code <= HANGUL_SYLLABLE_LAST) {
    return foldedChoseong(Math.floor((code - HANGUL_SYLLABLE_BASE) / 588))
  }

  const compatIndex = CHOSEONG.indexOf(character)
  if (compatIndex >= 0) return foldedChoseong(compatIndex)

  if (code >= CHOSEONG_JAMO_BASE && code < CHOSEONG_JAMO_BASE + CHOSEONG.length) {
    return foldedChoseong(code - CHOSEONG_JAMO_BASE)
  }

  return null
}

function letterSection(character: string): string | null {
  if (!/^\p{L}$/u.test(character)) return null
  const base = [...character.normalize("NFD").replace(/\p{M}/gu, "")][0]
  if (!base || !/^\p{L}$/u.test(base)) return null
  return [...base.toLocaleUpperCase("en")][0] ?? null
}

/** Section label for a recipe title. Hangul uses the leading consonant. */
export function recipeSectionKey(title: string): string {
  for (const character of title.trim()) {
    const hangul = hangulSection(character)
    if (hangul) return hangul
    const letter = letterSection(character)
    if (letter) return letter
    if (/^\p{N}$/u.test(character)) return OTHER_SECTION
  }
  return OTHER_SECTION
}

function isHangulSection(key: string): boolean {
  return HANGUL_SECTION_ORDER.includes(key)
}

function sectionBucket(key: string, language: SupportedLanguageCode): number {
  if (key === OTHER_SECTION) return 2
  const hangulFirst = language === "ko"
  if (isHangulSection(key)) return hangulFirst ? 0 : 1
  return hangulFirst ? 1 : 0
}

function compareSectionKeys(a: string, b: string, language: SupportedLanguageCode): number {
  const bucket = sectionBucket(a, language) - sectionBucket(b, language)
  if (bucket !== 0) return bucket
  if (isHangulSection(a) && isHangulSection(b)) {
    return HANGUL_SECTION_ORDER.indexOf(a) - HANGUL_SECTION_ORDER.indexOf(b)
  }
  return a.localeCompare(b, language, { sensitivity: "base" })
}

export function groupRecipesBySection<T extends RecipeIndexItem>(
  recipes: readonly T[],
  language: SupportedLanguageCode,
): RecipeIndexSection<T>[] {
  const sorted = [...recipes].sort((a, b) => {
    const section = compareSectionKeys(
      recipeSectionKey(a.title),
      recipeSectionKey(b.title),
      language,
    )
    if (section !== 0) return section
    const title = a.title.localeCompare(b.title, language, { sensitivity: "base", numeric: true })
    if (title !== 0) return title
    return a.id.localeCompare(b.id)
  })

  const sections: RecipeIndexSection<T>[] = []
  for (const recipe of sorted) {
    const title = recipeSectionKey(recipe.title)
    const current = sections[sections.length - 1]
    if (current?.title === title) {
      current.data.push(recipe)
    } else {
      sections.push({ title, data: [recipe] })
    }
  }
  return sections
}
