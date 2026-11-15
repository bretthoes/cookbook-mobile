import { beforeEach, describe, expect, it, vi } from "vitest"

const secureStore = new Map<string, string>()

vi.mock("expo-secure-store", () => ({
  getItemAsync: vi.fn(async (key: string) => secureStore.get(key) ?? null),
  setItemAsync: vi.fn(async (key: string, value: string) => {
    secureStore.set(key, value)
  }),
}))

vi.mock("@/config", () => ({ default: { API_URL: "http://api.test/api" } }))

const { createApiClient, setAccessToken } = await import("@/services/api/client")

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

describe("authFetch", () => {
  beforeEach(() => {
    secureStore.clear()
    setAccessToken(null)
  })

  it("does not expire the session when login returns 401", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(401, { detail: "NotAllowed" }))
    vi.stubGlobal("fetch", fetchMock)
    const api = createApiClient()
    const onSessionExpired = vi.fn()
    api.setSessionExpiredCallback(onSessionExpired)

    await api.client.POST("/api/Users/login", { body: { email: "a@b.co", password: "x" } })

    expect(onSessionExpired).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("resends the original body after refreshing an expired token", async () => {
    secureStore.set("accessToken", "expired")
    secureStore.set("refreshToken", "refresh")
    const updateBodies: string[] = []
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init)
      if (request.url.endsWith("/api/Users/refresh")) {
        return jsonResponse(200, { accessToken: "fresh", refreshToken: "refresh2" })
      }
      updateBodies.push(await request.text())
      return request.headers.get("Authorization") === "Bearer fresh"
        ? new Response(null, { status: 204 })
        : jsonResponse(401)
    })
    vi.stubGlobal("fetch", fetchMock)
    const api = createApiClient()

    await api.client.POST("/api/Users/update", { body: { displayName: "Brett" } })

    expect(updateBodies).toEqual([
      JSON.stringify({ displayName: "Brett" }),
      JSON.stringify({ displayName: "Brett" }),
    ])
  })
})
