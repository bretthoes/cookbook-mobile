import { beforeEach, describe, expect, it, vi } from "vitest"

const openURL = vi.fn()
const canOpenURL = vi.fn()
const alert = vi.fn()
const setStringAsync = vi.fn()

vi.mock("react-native", () => ({
  Linking: {
    openURL: (...args: unknown[]) => openURL(...args),
    canOpenURL: (...args: unknown[]) => canOpenURL(...args),
  },
  Alert: {
    alert: (...args: unknown[]) => alert(...args),
  },
}))

vi.mock("expo-clipboard", () => ({
  setStringAsync: (...args: unknown[]) => setStringAsync(...args),
}))

vi.mock("@/i18n/translate", () => ({
  translate: (key: string, options?: { email?: string }) =>
    options?.email ? `${key}:${options.email}` : key,
}))

const { openLinkInBrowser } = await import("@/utils/openLinkInBrowser")

describe("openLinkInBrowser", () => {
  beforeEach(() => {
    openURL.mockReset()
    canOpenURL.mockReset()
    alert.mockReset()
    setStringAsync.mockReset()
  })

  it("opens a mailto link when a mail app is available", async () => {
    openURL.mockResolvedValue(undefined)

    await openLinkInBrowser("mailto:bretthoes@proton.me?subject=Language%20Support%20Request")

    expect(openURL).toHaveBeenCalledWith(
      "mailto:bretthoes@proton.me?subject=Language%20Support%20Request",
    )
    expect(canOpenURL).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
  })

  it("shows the address when the device cannot open a mailto link", async () => {
    openURL.mockRejectedValue(new Error("Unable to open URL: mailto:bretthoes@proton.me"))

    await openLinkInBrowser("mailto:bretthoes@proton.me?subject=Language%20Support%20Request")

    expect(alert).toHaveBeenCalledWith(
      "common:mailUnavailableTitle",
      "common:mailUnavailableMessage:bretthoes@proton.me",
      expect.any(Array),
    )

    const actions = alert.mock.calls[0][2] as { onPress?: () => void }[]
    actions[1].onPress?.()
    expect(setStringAsync).toHaveBeenCalledWith("bretthoes@proton.me")
  })

  it("does not alert when a normal link cannot be opened", async () => {
    canOpenURL.mockResolvedValue(false)

    await openLinkInBrowser("https://sharedcookbook.com")

    expect(openURL).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
  })
})
