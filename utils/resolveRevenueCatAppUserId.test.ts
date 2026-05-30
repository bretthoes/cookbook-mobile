import { beforeEach, describe, expect, it, vi } from "vitest"
import { resolveRevenueCatAppUserId } from "@/utils/resolveRevenueCatAppUserId"

const mocks = vi.hoisted(() => ({
  getAccessToken: vi.fn(),
  getEmail: vi.fn(),
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
}))

vi.mock("@/services/api/client", () => ({
  getAccessToken: mocks.getAccessToken,
}))

vi.mock("@/services/api", () => ({
  api: { getEmail: mocks.getEmail },
}))

vi.mock("expo-secure-store", () => ({
  getItemAsync: mocks.getItemAsync,
  setItemAsync: mocks.setItemAsync,
}))

describe("resolveRevenueCatAppUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getAccessToken.mockReturnValue(null)
    mocks.getItemAsync.mockResolvedValue(null)
    mocks.getEmail.mockResolvedValue({ kind: "ok", email: "Chef@Example.com" })
  })

  it("prefers storedUserId and normalizes to lowercase", async () => {
    await expect(
      resolveRevenueCatAppUserId({
        storedUserId: "  Chef@Example.COM ",
        authEmail: "other@example.com",
      }),
    ).resolves.toBe("chef@example.com")
    expect(mocks.getItemAsync).not.toHaveBeenCalled()
  })

  it("falls back to authEmail when storedUserId is blank", async () => {
    await expect(
      resolveRevenueCatAppUserId({ storedUserId: "  ", authEmail: "Auth@Example.com" }),
    ).resolves.toBe("auth@example.com")
  })

  it("reads email from secure store before calling the API", async () => {
    mocks.getItemAsync.mockResolvedValue("Stored@Example.com")
    await expect(resolveRevenueCatAppUserId()).resolves.toBe("stored@example.com")
    expect(mocks.getEmail).not.toHaveBeenCalled()
  })

  it("fetches email from API when logged in and caches it", async () => {
    mocks.getAccessToken.mockReturnValue("token")
    mocks.getEmail.mockResolvedValue({ kind: "ok", email: "Api@Example.com" })

    await expect(resolveRevenueCatAppUserId()).resolves.toBe("api@example.com")
    expect(mocks.setItemAsync).toHaveBeenCalledWith("email", "api@example.com")
  })

  it("returns null when not logged in and no cached email", async () => {
    mocks.getEmail.mockResolvedValue({ kind: "ok", email: "api@example.com" })
    await expect(resolveRevenueCatAppUserId()).resolves.toBeNull()
    expect(mocks.getEmail).not.toHaveBeenCalled()
  })

  it("returns null when API does not return an email", async () => {
    mocks.getAccessToken.mockReturnValue("token")
    mocks.getEmail.mockResolvedValue({ kind: "not-found" })
    await expect(resolveRevenueCatAppUserId()).resolves.toBeNull()
    expect(mocks.setItemAsync).not.toHaveBeenCalled()
  })
})
