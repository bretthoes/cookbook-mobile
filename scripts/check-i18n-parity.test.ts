import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function readLocale(name: string): string {
  return fs.readFileSync(path.join(root, "i18n", name), "utf8")
}

/** Top-level keys in en.ts object literal (e.g. common, errors, loginScreen). */
function topLevelKeys(content: string): string[] {
  const match = content.match(/^const en = \{([\s\S]*)\n\}\s*$/m)
  if (!match) return []
  const body = match[1]
  const keys: string[] = []
  const re = /^  ([a-zA-Z0-9_]+): \{/gm
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    keys.push(m[1])
  }
  return keys
}

function countPlaceholders(content: string): number {
  return (content.match(/"___/g) ?? []).length
}

describe("i18n locale parity", () => {
  const enContent = readLocale("en.ts")
  const enKeys = topLevelKeys(enContent)

  it("en.ts has expected top-level sections", () => {
    expect(enKeys).toContain("common")
    expect(enKeys).toContain("errors")
    expect(enKeys).toContain("loginScreen")
    expect(enKeys).toContain("cookbooksScreen")
  })

  for (const locale of ["fr.ts", "ko.ts"] as const) {
    it(`${locale} includes all top-level keys from en`, () => {
      const content = readLocale(locale)
      for (const key of enKeys) {
        expect(content, `missing top-level key: ${key}`).toMatch(new RegExp(`^  ${key}: \\{`, "m"))
      }
    })

    it(`${locale} has no untranslated ___ placeholders`, () => {
      const placeholders = countPlaceholders(readLocale(locale))
      expect(placeholders).toBe(0)
    })
  }
})
