import Config from "@/config"
import { isValidRevenueCatApiKey } from "@/services/subscription/revenueCatApiKey"
import { extractPlansFromOffering } from "@/services/subscription/revenueCatPlans"

import type { CustomerInfo, PurchasesError } from "react-native-purchases"

let onCustomerInfoUpdate: ((customerInfo: CustomerInfo) => void) | null = null

export function setRevenueCatCustomerInfoHandler(
  handler: (customerInfo: CustomerInfo) => void,
): void {
  onCustomerInfoUpdate = handler
}

export {
  hasProEntitlement,
  isUserCancelledPurchase,
  PRO_ENTITLEMENT_ID,
} from "@/services/subscription/entitlements"

let sdkConfigured = false

let activeUserId: string | null = null

let removeCustomerInfoListener: (() => void) | null = null

export function isRevenueCatConfigured(): boolean {
  return isValidRevenueCatApiKey(Config.REVENUECAT_API_KEY)
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

    const current = offerings.current ?? Object.values(offerings.all)[0] ?? null

    if (!current) {
      return { ok: false, reason: "no_offering" }
    }

    const plans = extractPlansFromOffering(current).map((plan) => ({
      packageIdentifier: plan.packageIdentifier,
      period: plan.period,
      priceString: plan.priceString,
    }))

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
