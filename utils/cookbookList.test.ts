import type { CookbookItem } from "@/types/cookbook"
import { describe, expect, it } from "vitest"
import { getCookbooksForList } from "./cookbookList"

function cookbook(id: string, title: string): CookbookItem {
  return {
    id,
    title,
    image: null,
    membersCount: 1,
    recipeCount: 0,
  }
}

const idA = "00000000-0000-0000-0000-000000000001"
const idB = "00000000-0000-0000-0000-000000000002"

describe("getCookbooksForList", () => {
  const cookbooks = [cookbook(idB, "Banana"), cookbook(idA, "Apple")]

  it("sorts by title regardless of source order", () => {
    expect(getCookbooksForList(cookbooks).map((c) => c.id)).toEqual([idA, idB])
  })
})
