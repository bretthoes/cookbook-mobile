import { describe, expect, it } from "vitest"
import { groupRecipesBySection, recipeSectionKey } from "./recipeIndex"

function recipe(id: string, title: string) {
  return { id, title }
}

describe("recipeSectionKey", () => {
  it("folds case and accents into the base letter", () => {
    expect(recipeSectionKey("apple pie")).toBe("A")
    expect(recipeSectionKey("Éclair")).toBe("E")
    expect(recipeSectionKey("(Leftovers) soup")).toBe("L")
  })

  it("groups hangul by the leading consonant and folds tense consonants", () => {
    expect(recipeSectionKey("김치찌개")).toBe("ㄱ")
    expect(recipeSectionKey("깍두기")).toBe("ㄱ")
    expect(recipeSectionKey("된장찌개")).toBe("ㄷ")
    expect(recipeSectionKey("비빔밥")).toBe("ㅂ")
  })

  it("puts titles that start with a number or symbol under #", () => {
    expect(recipeSectionKey("10-minute chili")).toBe("#")
    expect(recipeSectionKey("...")).toBe("#")
    expect(recipeSectionKey("   ")).toBe("#")
  })
})

describe("groupRecipesBySection", () => {
  const recipes = [
    recipe("1", "banana bread"),
    recipe("2", "Apple pie"),
    recipe("3", "Éclair"),
    recipe("4", "egg tart"),
    recipe("5", "김치찌개"),
    recipe("6", "깍두기"),
    recipe("7", "된장찌개"),
    recipe("8", "10-minute chili"),
  ]

  it("builds latin sections before hangul when the language is english", () => {
    const titles = groupRecipesBySection(recipes, "en").map((section) => section.title)
    expect(titles).toEqual(["A", "B", "E", "ㄱ", "ㄷ", "#"])
  })

  it("builds hangul sections before latin when the language is korean", () => {
    const titles = groupRecipesBySection(recipes, "ko").map((section) => section.title)
    expect(titles).toEqual(["ㄱ", "ㄷ", "A", "B", "E", "#"])
  })

  it("keeps accented and plain letters in one section, ordered by title", () => {
    const sweets = groupRecipesBySection(recipes, "fr").find((section) => section.title === "E")
    expect(sweets?.data.map((item) => item.title)).toEqual(["Éclair", "egg tart"])
  })

  it("keeps both ㄱ titles together", () => {
    const section = groupRecipesBySection(recipes, "ko").find((item) => item.title === "ㄱ")
    expect(section?.data.map((item) => item.title)).toEqual(["김치찌개", "깍두기"])
  })
})
