import { describe, expect, it } from "vitest"
import { recipeUrlUsesVideoExtraction } from "@/utils/recipeImportUrl"

describe("recipeUrlUsesVideoExtraction", () => {
  it("turns video extraction on for TikTok, Instagram, Pinterest, and YouTube Shorts", () => {
    expect(recipeUrlUsesVideoExtraction("https://www.tiktok.com/@cook/video/1")).toBe(true)
    expect(recipeUrlUsesVideoExtraction("https://vm.tiktok.com/ABC")).toBe(true)
    expect(recipeUrlUsesVideoExtraction("https://www.instagram.com/reel/abc")).toBe(true)
    expect(recipeUrlUsesVideoExtraction("https://www.pinterest.com/pin/1")).toBe(true)
    expect(recipeUrlUsesVideoExtraction("https://pin.it/abc")).toBe(true)
    expect(recipeUrlUsesVideoExtraction("https://www.youtube.com/shorts/abc")).toBe(true)
    expect(recipeUrlUsesVideoExtraction("https://m.youtube.com/shorts/abc?si=1")).toBe(true)
  })

  it("leaves video extraction off for a recipe website or a full YouTube video", () => {
    expect(recipeUrlUsesVideoExtraction("https://www.example.com/banana-bread")).toBe(false)
    expect(recipeUrlUsesVideoExtraction("https://www.youtube.com/watch?v=abc")).toBe(false)
    expect(recipeUrlUsesVideoExtraction("https://youtu.be/abc")).toBe(false)
    expect(recipeUrlUsesVideoExtraction("not a url")).toBe(false)
  })
})
