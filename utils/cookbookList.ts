import type { CookbookItem } from "@/types/cookbook"

export function compareCookbooksByTitle(a: CookbookItem, b: CookbookItem): number {
  const titleCompare = a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  if (titleCompare !== 0) return titleCompare
  return a.id.localeCompare(b.id)
}

export function getCookbooksForList(cookbooks: CookbookItem[]): CookbookItem[] {
  return [...cookbooks].sort(compareCookbooksByTitle)
}
