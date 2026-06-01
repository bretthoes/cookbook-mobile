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
    expect(getCookbooksForList(cookbooks).map((c) => c.id)).toEqual([1, 2])
  })
})
