import { describe, expect, it, vi } from "vitest"
import { inviteLinkPreview, toInviteUrl, validateInviteEmail } from "@/utils/invitations"

vi.mock("@/config", () => ({
  default: {
    INVITE_BASE_URL: "https://cookbook.example",
  },
}))

describe("toInviteUrl", () => {
  it("builds an encoded invite URL", () => {
    expect(toInviteUrl("abc+token")).toBe("https://cookbook.example/invite/?t=abc%2Btoken")
  })
})

describe("inviteLinkPreview", () => {
  it("hides the token and keeps the host and path", () => {
    expect(inviteLinkPreview("https://sharedcookbook.com/invite/?t=secret.token")).toBe(
      "sharedcookbook.com/invite/…",
    )
  })

  it("returns the original string when it is not a URL", () => {
    expect(inviteLinkPreview("not a url")).toBe("not a url")
  })
})

describe("validateInviteEmail", () => {
  it("rejects empty email", () => {
    expect(validateInviteEmail("")).toBe("can't be blank")
  })

  it("rejects short email", () => {
    expect(validateInviteEmail("a@b")).toBe("must be at least 6 characters")
  })

  it("rejects invalid format", () => {
    expect(validateInviteEmail("not-an-email")).toBe("must be a valid email address")
  })

  it("accepts valid email", () => {
    expect(validateInviteEmail("chef@example.com")).toBe("")
  })
})
