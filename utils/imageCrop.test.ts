import { describe, expect, it } from "vitest"
import {
  clampImageTranslation,
  containScale,
  coverScale,
  frameInsideImage,
  imageCropRect,
} from "./imageCrop"

describe("containScale", () => {
  it("fits a landscape photo entirely inside a portrait area", () => {
    expect(containScale(4000, 3000, 360, 700)).toBeCloseTo(360 / 4000)
  })
})

describe("frameInsideImage", () => {
  it("keeps a portrait frame inside the full landscape photo", () => {
    const displayedWidth = 360
    const displayedHeight = 270
    const frame = frameInsideImage(displayedWidth, displayedHeight, 3 / 4)

    expect(frame.height).toBeCloseTo(displayedHeight)
    expect(frame.width).toBeLessThan(displayedWidth)
    expect(frame.width / frame.height).toBeCloseTo(3 / 4)
  })
})
describe("coverScale", () => {
  it("scales a landscape photo until it covers a portrait frame", () => {
    expect(coverScale(4000, 3000, 300, 400)).toBeCloseTo(400 / 3000)
  })
})

describe("clampImageTranslation", () => {
  it("allows no pan when the image exactly covers the frame", () => {
    expect(
      clampImageTranslation({
        imageWidth: 300,
        imageHeight: 400,
        frameWidth: 300,
        frameHeight: 400,
        scale: 1,
        translateX: 40,
        translateY: -20,
      }),
    ).toEqual({ translateX: 0, translateY: 0 })
  })
})

describe("imageCropRect", () => {
  it("center-crops a landscape photo to the portrait frame", () => {
    const scale = coverScale(4000, 3000, 300, 400)
    const crop = imageCropRect({
      imageWidth: 4000,
      imageHeight: 3000,
      frameWidth: 300,
      frameHeight: 400,
      scale,
      translateX: 0,
      translateY: 0,
    })

    expect(crop.originY).toBe(0)
    expect(crop.height).toBe(3000)
    expect(crop.width / crop.height).toBeCloseTo(3 / 4, 1)
    expect(crop.originX).toBeGreaterThan(0)
  })

  it("center-crops a landscape photo to a square", () => {
    const scale = coverScale(4000, 3000, 300, 300)
    const crop = imageCropRect({
      imageWidth: 4000,
      imageHeight: 3000,
      frameWidth: 300,
      frameHeight: 300,
      scale,
      translateX: 0,
      translateY: 0,
    })

    expect(crop.height).toBe(3000)
    expect(crop.width).toBe(3000)
    expect(crop.originY).toBe(0)
  })

  it("keeps the whole landscape photo in view around a portrait frame", () => {
    const fit = containScale(4000, 3000, 360, 700)
    const displayedWidth = 4000 * fit
    const displayedHeight = 3000 * fit
    const frame = frameInsideImage(displayedWidth, displayedHeight, 3 / 4)
    const crop = imageCropRect({
      imageWidth: 4000,
      imageHeight: 3000,
      frameWidth: frame.width,
      frameHeight: frame.height,
      scale: fit,
      translateX: 0,
      translateY: 0,
    })

    expect(crop.originY).toBe(0)
    expect(crop.height).toBe(3000)
    expect(crop.width).toBeLessThan(4000)
    expect(crop.width / crop.height).toBeCloseTo(3 / 4, 1)
  })
})
