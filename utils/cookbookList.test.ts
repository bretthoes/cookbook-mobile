import { describe, expect, it } from "vitest"
import { getCookbooksForList } from "./cookbookList"
import type { CookbookItem } from "@/types/cookbook"

function cookbook(id: number, title: string): CookbookItem {
  return {
    id,
    title,
    image: null,
    author: null,
    authorEmail: null,
    membersCount: 1,
    recipeCount: 0,
  }
}

describe("getCookbooksForList", () => {
  const cookbooks = [cookbook(2, "Banana"), cookbook(1, "Apple")]

  it("sorts by title regardless of source order", () => {
    expect(getCookbooksForList(cookbooks, false, []).map((c) => c.id)).toEqual([1, 2])
  })

  it("keeps the same order when toggling favorites-only with all items favorited", () => {
    const favoriteIds = [2, 1]
    const all = getCookbooksForList(cookbooks, false, favoriteIds).map((c) => c.id)
    const favoritesOnly = getCookbooksForList(cookbooks, true, favoriteIds).map((c) => c.id)
    expect(favoritesOnly).toEqual(all)
  })

  it("filters to favorites while preserving title order", () => {
    const favoriteIds = [2]
    expect(getCookbooksForList(cookbooks, true, favoriteIds).map((c) => c.id)).toEqual([2])
  })
})
