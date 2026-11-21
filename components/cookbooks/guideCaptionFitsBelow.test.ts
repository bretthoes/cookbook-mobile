import { describe, expect, it } from "vitest"
import { guideCaptionFitsBelow } from "./guideCaptionFitsBelow"

const caption = {
  captionHeight: 60,
  gap: 12,
  edgeMargin: 12,
  windowHeight: 800,
  bottomInset: 48,
}

describe("guideCaptionFitsBelow", () => {
  it("flips above a floating button that sits against the bottom of a tab screen", () => {
    expect(
      guideCaptionFitsBelow({
        ...caption,
        holeBottom: 624,
        overlayTop: 0,
        overlayHeight: 640,
      }),
    ).toBe(false)
  })

  it("flips above a floating button that sits just over the system navigation bar", () => {
    expect(
      guideCaptionFitsBelow({
        ...caption,
        holeBottom: 736,
        overlayTop: 0,
        overlayHeight: 800,
      }),
    ).toBe(false)
  })

  it("keeps the note below a target with room underneath", () => {
    expect(
      guideCaptionFitsBelow({
        ...caption,
        holeBottom: 200,
        overlayTop: 0,
        overlayHeight: 800,
      }),
    ).toBe(true)
  })

  it("stays above a floating button when the window is taller than the overlay", () => {
    const overlayHeight = 700
    expect(
      guideCaptionFitsBelow({
        ...caption,
        bottomInset: 0,
        holeBottom: overlayHeight - 16,
        overlayTop: 0,
        overlayHeight,
        windowHeight: 900,
      }),
    ).toBe(false)
  })

  it("uses the window until the overlay has been measured", () => {
    expect(
      guideCaptionFitsBelow({
        ...caption,
        holeBottom: 736,
        overlayTop: 0,
        overlayHeight: 0,
      }),
    ).toBe(false)
  })
})
