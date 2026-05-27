import Config from "@/config"
import type { CustomerInfo, PurchasesError } from "react-native-purchases"

let onCustomerInfoUpdate: ((customerInfo: CustomerInfo) => void) | null = null

export function setRevenueCatCustomerInfoHandler(
  handler: (customerInfo: CustomerInfo) => void,
): void {
  onCustomerInfoUpdate = handler
}

/** RevenueCat entitlement identifier (dashboard slug). */
export const PRO_ENTITLEMENT_ID = "pro"

let sdkConfigured = false
let activeUserId: string | null = null
let removeCustomerInfoListener: (() => void) | null = null

export function hasProEntitlement(customerInfo: CustomerInfo): boolean {
  return customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
}

export function isRevenueCatConfigured(): boolean {
  const key = Config.REVENUECAT_API_KEY
  return Boolean(key) && /^(?:test_|appl_|goog_)/.test(key)
}

function isInvalidRevenueCatApiKeyError(error: unknown): boolean {
  const err = error as PurchasesError & { underlyingErrorMessage?: string }
  const parts = [
    err?.message,
    err?.underlyingErrorMessage,
    error instanceof Error ? error.message : String(error),
  ]
  return parts.some((part) => /invalid api key/i.test(part ?? ""))
}

export async function ensureRevenueCatConfigured(): Promise<void> {
  if (!isRevenueCatConfigured() || sdkConfigured) return

  try {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

    const Purchases = (await import("react-native-purchases")).default
    Purchases.configure({ apiKey: Config.REVENUECAT_API_KEY })
    sdkConfigured = true

    if (!removeCustomerInfoListener) {
      const listener = (customerInfo: CustomerInfo) => {
        onCustomerInfoUpdate?.(customerInfo)
      }
      Purchases.addCustomerInfoUpdateListener(listener)
      removeCustomerInfoListener = () => Purchases.removeCustomerInfoUpdateListener(listener)
    }
  } catch {
    // Subscriptions stay disabled; paywall surfaces not_configured / invalid_api_key.
  }
}

export async function ensureRevenueCatReady(appUserID?: string | null): Promise<void> {
  if (!isRevenueCatConfigured()) return

  await ensureRevenueCatConfigured()

  const userId = appUserID?.trim()
  if (!userId || !sdkConfigured) return

  try {
    const Purchases = (await import("react-native-purchases")).default

    if (activeUserId !== userId) {
      await Purchases.logIn(userId)
      activeUserId = userId
    }
  } catch {
    // ignore
  }
}

export async function logOutRevenueCat(): Promise<void> {
  if (!sdkConfigured || !activeUserId) return

  try {
    const Purchases = (await import("react-native-purchases")).default
    await Purchases.logOut()
    activeUserId = null
  } catch {
    // ignore (e.g. already anonymous)
  }
}

export function isUserCancelledPurchase(error: unknown): boolean {
  const purchasesError = error as PurchasesError
  return purchasesError?.userCancelled === true
}

export type PaywallPlan = {
  packageIdentifier: string
  period: "monthly" | "annual"
  priceString: string
}

export type FetchPaywallPlansFailureReason =
  | "not_configured"
  | "invalid_api_key"
  | "not_logged_in"
  | "no_offering"
  | "no_packages"
  | "error"

export type FetchPaywallPlansResult =
  | { ok: true; plans: PaywallPlan[] }
  | { ok: false; reason: FetchPaywallPlansFailureReason }

export async function fetchPaywallPlans(
  appUserID?: string | null,
): Promise<FetchPaywallPlansResult> {
  if (!isRevenueCatConfigured()) {
    return { ok: false, reason: "not_configured" }
  }

  try {
    await ensureRevenueCatReady(appUserID)
    const Purchases = (await import("react-native-purchases")).default
    const offerings = await Purchases.getOfferings()

    const current =
      offerings.current ?? Object.values(offerings.all)[0] ?? null

    if (!current) {
      return { ok: false, reason: "no_offering" }
    }

    const plans = extractPlansFromOffering(current)

    if (plans.length === 0) {
      return { ok: false, reason: "no_packages" }
    }

    return { ok: true, plans }
  } catch (e) {
    if (isInvalidRevenueCatApiKeyError(e)) {
      return { ok: false, reason: "invalid_api_key" }
    }
    return { ok: false, reason: "error" }
  }
}

function extractPlansFromOffering(
  offering: import("react-native-purchases").PurchasesOffering,
): PaywallPlan[] {
  const plans: PaywallPlan[] = []
  const seen = new Set<string>()

  const add = (pkg: import("react-native-purchases").PurchasesPackage, period: PaywallPlan["period"]) => {
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

export async function presentCustomerCenter(appUserID: string): Promise<void> {
  if (!isRevenueCatConfigured()) return

  await ensureRevenueCatReady(appUserID)

  const RevenueCatUI = (await import("react-native-purchases-ui")).default
  await RevenueCatUI.presentCustomerCenter()
}

export function teardownRevenueCatListener(): void {
  removeCustomerInfoListener?.()
  removeCustomerInfoListener = null
}
