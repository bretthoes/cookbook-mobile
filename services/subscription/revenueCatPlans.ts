export type PaywallPlanPeriod = "monthly" | "annual"

export type PaywallPlanPackage = {
  identifier: string
  packageType: string | number
  product: { identifier: string; priceString: string }
}

export type PaywallOffering = {
  monthly?: PaywallPlanPackage | null
  annual?: PaywallPlanPackage | null
  availablePackages: PaywallPlanPackage[]
}

export type ExtractedPaywallPlan = {
  packageIdentifier: string
  period: PaywallPlanPeriod
  priceString: string
}

/**
 * Builds monthly/annual plan options from a RevenueCat offering shape.
 */
export function extractPlansFromOffering(offering: PaywallOffering): ExtractedPaywallPlan[] {
  const plans: ExtractedPaywallPlan[] = []
  const seen = new Set<string>()

  const add = (pkg: PaywallPlanPackage, period: PaywallPlanPeriod) => {
    if (seen.has(pkg.identifier)) return
    seen.add(pkg.identifier)
    plans.push({
      packageIdentifier: pkg.identifier,
      period,
      priceString: pkg.product.priceString,
    })
  }

  if (offering.monthly) add(offering.monthly, "monthly")
  if (offering.annual) add(offering.annual, "annual")
  if (plans.length > 0) return plans

  for (const pkg of offering.availablePackages) {
    const productId = pkg.product.identifier.toLowerCase()
    const packageType = String(pkg.packageType).toUpperCase()

    if (packageType === "MONTHLY" || productId === "monthly" || productId.includes("month")) {
      add(pkg, "monthly")
    } else if (
      packageType === "ANNUAL" ||
      productId === "yearly" ||
      productId === "annual" ||
      productId.includes("year")
    ) {
      add(pkg, "annual")
    }
  }

  return plans
}
