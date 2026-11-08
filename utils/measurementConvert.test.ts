import { describe, expect, it } from "vitest"
import {
  convertMeasurement,
  formatMeasurementAmount,
  measurementFamily,
  parseMeasurementAmount,
} from "@/utils/measurementConvert"

describe("parseMeasurementAmount", () => {
  it("parses decimals, fractions, and mixed numbers", () => {
    expect(parseMeasurementAmount("6")).toBe(6)
    expect(parseMeasurementAmount("  .5 ")).toBe(0.5)
    expect(parseMeasurementAmount("1,5")).toBe(1.5)
    expect(parseMeasurementAmount("1/2")).toBe(0.5)
    expect(parseMeasurementAmount("1 1/2")).toBe(1.5)
    expect(parseMeasurementAmount("1⁄2")).toBe(0.5)
    expect(parseMeasurementAmount("½")).toBe(0.5)
    expect(parseMeasurementAmount("1½")).toBe(1.5)
    expect(parseMeasurementAmount("2 ½")).toBe(2.5)
  })

  it("rejects blank, ranges, and non-numeric text", () => {
    expect(parseMeasurementAmount("")).toBeNull()
    expect(parseMeasurementAmount("   ")).toBeNull()
    expect(parseMeasurementAmount("2-3")).toBeNull()
    expect(parseMeasurementAmount("1/0")).toBeNull()
    expect(parseMeasurementAmount("6 tablespoons")).toBeNull()
    expect(parseMeasurementAmount("-1")).toBeNull()
  })
})

describe("convertMeasurement", () => {
  it("converts volume with exact kitchen ratios", () => {
    expect(convertMeasurement(6, "tbsp", "cup")).toBe(0.375)
    expect(convertMeasurement(1, "cup", "tbsp")).toBe(16)
    expect(convertMeasurement(1, "tbsp", "tsp")).toBe(3)
    expect(convertMeasurement(1, "cup", "flOz")).toBe(8)
    expect(convertMeasurement(1, "stick", "cup")).toBe(0.5)
    expect(convertMeasurement(1, "stick", "tbsp")).toBe(8)
    expect(convertMeasurement(1, "pint", "cup")).toBe(2)
    expect(convertMeasurement(1, "quart", "pint")).toBe(2)
    expect(convertMeasurement(1, "l", "ml")).toBe(1000)
    expect(convertMeasurement(4, "cup", "cup")).toBe(4)
  })

  it("converts weight and refuses to cross families", () => {
    expect(convertMeasurement(1, "lb", "oz")).toBeCloseTo(16, 8)
    expect(convertMeasurement(1, "kg", "g")).toBe(1000)
    expect(convertMeasurement(1, "cup", "g")).toBeNull()
    expect(convertMeasurement(2, "oz", "ml")).toBeNull()
    expect(convertMeasurement(Number.NaN, "tbsp", "cup")).toBeNull()
  })

  it("reports each unit's family", () => {
    expect(measurementFamily("cup")).toBe("volume")
    expect(measurementFamily("stick")).toBe("volume")
    expect(measurementFamily("oz")).toBe("weight")
  })
})

describe("formatMeasurementAmount", () => {
  it("uses a friendly fraction when the value is close", () => {
    expect(formatMeasurementAmount(0.375)).toBe("3/8")
    expect(formatMeasurementAmount(0.5)).toBe("1/2")
    expect(formatMeasurementAmount(1.5)).toBe("1 1/2")
    expect(formatMeasurementAmount(1 / 3)).toBe("1/3")
    expect(formatMeasurementAmount(2 / 3)).toBe("2/3")
    expect(formatMeasurementAmount(0.25)).toBe("1/4")
    expect(formatMeasurementAmount(0.75)).toBe("3/4")
    expect(formatMeasurementAmount(1000 / 240)).toBe("4 1/6")
  })

  it("keeps whole numbers and awkward values as decimals", () => {
    expect(formatMeasurementAmount(0)).toBe("0")
    expect(formatMeasurementAmount(2)).toBe("2")
    expect(formatMeasurementAmount(90)).toBe("90")
    expect(formatMeasurementAmount(28.349523125)).toBe("28.35")
    expect(formatMeasurementAmount(0.001)).toBe("0.001")
    expect(formatMeasurementAmount(Number.NaN)).toBe("")
  })

  it("formats the tablespoon-to-cup example as eighths of a cup", () => {
    const cups = convertMeasurement(6, "tbsp", "cup")
    expect(cups).not.toBeNull()
    expect(formatMeasurementAmount(cups ?? 0)).toBe("3/8")
  })
})
