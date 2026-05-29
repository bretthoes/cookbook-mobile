export function parsePriceAmount(priceString: string): number | null {
  const normalized = priceString.replace(/[^\d.,]/g, "").replace(",", ".")
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : null
}

export function computeAnnualSavingsPercent(
  monthlyPrice: string,
  annualPrice: string,
): number | undefined {
  const monthly = parsePriceAmount(monthlyPrice)
  const annual = parsePriceAmount(annualPrice)
  if (monthly === null || annual === null) return undefined
  const monthlyAnnualized = monthly * 12
  if (monthlyAnnualized <= 0) return undefined
  return Math.round((1 - annual / monthlyAnnualized) * 100)
}
