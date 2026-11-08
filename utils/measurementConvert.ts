/**
 * Kitchen measurement conversion.
 *
 * Volume uses culinary factors that keep US ratios exact: 1 tsp = 5 ml,
 * 1 tbsp = 15 ml, 1 cup = 240 ml. Weight uses the international avoirdupois
 * ounce (28.349523125 g) and pound (453.59237 g). Volume and weight are
 * separate families — a cup is never converted to grams.
 */

export const VOLUME_UNITS = [
  "tsp",
  "tbsp",
  "flOz",
  "stick",
  "cup",
  "pint",
  "quart",
  "ml",
  "l",
] as const

export const WEIGHT_UNITS = ["oz", "lb", "g", "kg"] as const

export type VolumeUnit = (typeof VOLUME_UNITS)[number]
export type WeightUnit = (typeof WEIGHT_UNITS)[number]
export type MeasurementUnit = VolumeUnit | WeightUnit
export type MeasurementFamily = "volume" | "weight"

const ML: Record<VolumeUnit, number> = {
  tsp: 5,
  tbsp: 15,
  flOz: 30,
  stick: 120,
  cup: 240,
  pint: 480,
  quart: 960,
  ml: 1,
  l: 1000,
}

const GRAMS: Record<WeightUnit, number> = {
  oz: 28.349523125,
  lb: 453.59237,
  g: 1,
  kg: 1000,
}

const UNICODE_FRACTIONS: Record<string, readonly [number, number]> = {
  "½": [1, 2],
  "⅓": [1, 3],
  "⅔": [2, 3],
  "¼": [1, 4],
  "¾": [3, 4],
  "⅙": [1, 6],
  "⅚": [5, 6],
  "⅛": [1, 8],
  "⅜": [3, 8],
  "⅝": [5, 8],
  "⅞": [7, 8],
}

/** Friendly cooking fractions, smallest gap first so the snap tolerance stays inside it. */
const FRIENDLY_FRACTIONS: readonly (readonly [number, number])[] = [
  [1, 8],
  [1, 6],
  [1, 4],
  [1, 3],
  [3, 8],
  [1, 2],
  [5, 8],
  [2, 3],
  [3, 4],
  [5, 6],
  [7, 8],
]

const FRACTION_SNAP = 0.012

const UNICODE_FRACTION_PATTERN = new RegExp(
  `^(\\d+)\\s*([${Object.keys(UNICODE_FRACTIONS).join("")}])$`,
)

export function measurementFamily(unit: MeasurementUnit): MeasurementFamily {
  return unit in ML ? "volume" : "weight"
}

export function parseMeasurementAmount(input: string): number | null {
  const trimmed = input.trim().replace(/\u2044/g, "/")
  if (!trimmed) return null

  const unicode = UNICODE_FRACTIONS[trimmed]
  if (unicode) return unicode[0] / unicode[1]

  const unicodeMixed = trimmed.match(UNICODE_FRACTION_PATTERN)
  if (unicodeMixed) {
    const fraction = UNICODE_FRACTIONS[unicodeMixed[2] ?? ""]
    if (!fraction) return null
    return Number(unicodeMixed[1]) + fraction[0] / fraction[1]
  }

  const mixed = trimmed.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/)
  if (mixed) {
    const denominator = Number(mixed[3])
    if (denominator === 0) return null
    return Number(mixed[1]) + Number(mixed[2]) / denominator
  }

  const fraction = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (fraction) {
    const denominator = Number(fraction[2])
    if (denominator === 0) return null
    return Number(fraction[1]) / denominator
  }

  const decimal = trimmed.replace(",", ".")
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(decimal)) return null
  const value = Number(decimal)
  return Number.isFinite(value) ? value : null
}

export function convertMeasurement(
  amount: number,
  from: MeasurementUnit,
  to: MeasurementUnit,
): number | null {
  if (!Number.isFinite(amount)) return null
  if (measurementFamily(from) !== measurementFamily(to)) return null
  if (from === to) return amount

  if (measurementFamily(from) === "volume") {
    return (amount * ML[from as VolumeUnit]) / ML[to as VolumeUnit]
  }

  return (amount * GRAMS[from as WeightUnit]) / GRAMS[to as WeightUnit]
}

export function formatMeasurementAmount(value: number): string {
  if (!Number.isFinite(value)) return ""

  const sign = value < 0 ? "-" : ""
  const absolute = Math.abs(value)
  if (absolute < 1e-9) return "0"

  const whole = Math.floor(absolute + 1e-9)
  const fraction = absolute - whole

  if (whole >= 1 && fraction < FRACTION_SNAP) return sign + String(whole)
  if (1 - fraction < FRACTION_SNAP) return sign + String(whole + 1)

  for (const [numerator, denominator] of FRIENDLY_FRACTIONS) {
    if (Math.abs(fraction - numerator / denominator) >= FRACTION_SNAP) continue
    const formatted = `${numerator}/${denominator}`
    return whole === 0 ? sign + formatted : `${sign}${whole} ${formatted}`
  }

  const rounded = Math.round(absolute * 1000) / 1000
  const decimal = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")
  return sign + decimal
}
