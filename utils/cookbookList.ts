import type { CookbookItem } from "@/types/cookbook"

export function compareCookbooksByTitle(a: CookbookItem, b: CookbookItem): number {
  const titleCompare = a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
  if (titleCompare !== 0) return titleCompare
  return a.id - b.id
}

export function getCookbooksForList(
  cookbooks: CookbookItem[],
  favoritesOnly: boolean,
  favoriteCookbookIds: number[],
): CookbookItem[] {
  const favoriteSet = new Set(favoriteCookbookIds)
  const visible = favoritesOnly ? cookbooks.filter((c) => favoriteSet.has(c.id)) : cookbooks
  return [...visible].sort(compareCookbooksByTitle)
}
