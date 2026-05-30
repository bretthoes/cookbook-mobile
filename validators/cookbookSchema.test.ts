import { describe, expect, it, vi } from "vitest"
import { cookbookSchema } from "@/validators/cookbookSchema"

vi.mock("@/i18n", () => ({
  translate: (key: string) => key,
}))

describe("cookbookSchema", () => {
  it("requires a non-empty title up to 255 characters", async () => {
    await expect(cookbookSchema.validate({ title: "", image: null })).rejects.toThrow()
    await expect(cookbookSchema.validate({ title: "My Cookbook", image: null })).resolves.toEqual({
      title: "My Cookbook",
      image: null,
    })
    await expect(cookbookSchema.validate({ title: "x".repeat(256), image: null })).rejects.toThrow()
  })

  it("allows null image and rejects overly long image keys", async () => {
    await expect(cookbookSchema.validate({ title: "OK", image: null })).resolves.toBeDefined()
    await expect(
      cookbookSchema.validate({ title: "OK", image: "x".repeat(2049) }),
    ).rejects.toThrow()
  })
})
