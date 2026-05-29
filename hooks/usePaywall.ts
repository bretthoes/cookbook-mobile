import {
  computeAnnualSavingsPercent,
  type PlanOption,
} from "@/components/subscription/PlanCard"
import { useStores } from "@/models/helpers/useStores"
import {
  ensureRevenueCatReady,
  fetchPaywallPlans,
  hasProEntitlement,
  isUserCancelledPurchase,
  type FetchPaywallPlansFailureReason,
} from "@/services/subscription/revenueCat"
import { resolveRevenueCatAppUserId } from "@/utils/resolveRevenueCatAppUserId"
import { router } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Alert } from "react-native"

export type OfferingsLoadError = FetchPaywallPlansFailureReason | "no_user_id"

export function usePaywall() {
  const { t } = useTranslation()
  const { subscriptionStore, authenticationStore } = useStores()

  const [offerings, setOfferings] = useState<PlanOption[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [offeringsError, setOfferingsError] = useState<OfferingsLoadError | null>(null)

  const resolveAppUserId = useCallback(async () => {
    const id = await resolveRevenueCatAppUserId({
      storedUserId: authenticationStore.userId,
      authEmail: authenticationStore.authEmail,
    })
    if (id && authenticationStore.userId !== id) {
      authenticationStore.setProp("userId", id)
    }
    return id
  }, [authenticationStore])

  const finishPaywall = useCallback(async () => {
    const appUserId = await resolveAppUserId()
    if (appUserId) await subscriptionStore.refresh(appUserId)
    router.back()
  }, [subscriptionStore, resolveAppUserId])

  const loadOfferings = useCallback(async () => {
    setIsLoadingOfferings(true)
    setOfferingsError(null)

    const appUserId = await resolveAppUserId()
    const result = await fetchPaywallPlans(appUserId)

    if (!result.ok) {
      setOfferings([])
      setOfferingsError(result.reason)
      setIsLoadingOfferings(false)
      return
    }

    const monthlyPlan = result.plans.find((p) => p.period === "monthly")

    const plans: PlanOption[] = result.plans.map((plan) => ({
      id: plan.packageIdentifier,
      period: plan.period,
      title: t(
        plan.period === "monthly" ? "paywallScreen:monthlyLabel" : "paywallScreen:annualLabel",
      ),
      price: plan.priceString,
      savingsPercent:
        plan.period === "annual" && monthlyPlan
          ? computeAnnualSavingsPercent(monthlyPlan.priceString, plan.priceString)
          : undefined,
    }))

    setOfferings(plans)
    const defaultPlan = plans.find((p) => p.period === "annual") ?? plans[0]
    if (defaultPlan) setSelectedPlan(defaultPlan.id)
    setIsLoadingOfferings(false)
  }, [t, resolveAppUserId])

  useEffect(() => {
    loadOfferings()
  }, [loadOfferings])

  const handleSubscribe = useCallback(async () => {
    if (!selectedPlan || isPurchasing) return

    const appUserId = await resolveAppUserId()
    if (!appUserId) {
      setOfferingsError(authenticationStore.isAuthenticated ? "no_user_id" : "not_logged_in")
      return
    }

    setIsPurchasing(true)
    try {
      await ensureRevenueCatReady(appUserId)
      const Purchases = (await import("react-native-purchases")).default
      const offeringsResult = await Purchases.getOfferings()
      const pkg = offeringsResult.current?.availablePackages.find(
        (p) => p.identifier === selectedPlan,
      )
      if (!pkg) {
        Alert.alert(t("paywallScreen:purchaseError"))
        return
      }

      const result = await Purchases.purchasePackage(pkg)
      if (hasProEntitlement(result.customerInfo)) {
        await finishPaywall()
      }
    } catch (e) {
      if (!isUserCancelledPurchase(e)) {
        Alert.alert(t("paywallScreen:purchaseError"))
      }
    } finally {
      setIsPurchasing(false)
    }
  }, [
    selectedPlan,
    isPurchasing,
    resolveAppUserId,
    finishPaywall,
    t,
    authenticationStore.isAuthenticated,
  ])

  const handleRestore = useCallback(async () => {
    if (isRestoring) return

    const appUserId = await resolveAppUserId()
    if (!appUserId) {
      setOfferingsError(authenticationStore.isAuthenticated ? "no_user_id" : "not_logged_in")
      return
    }

    setIsRestoring(true)
    try {
      await ensureRevenueCatReady(appUserId)
      await subscriptionStore.refresh(appUserId)
      const isNowPro = subscriptionStore.isPro
      Alert.alert(isNowPro ? t("paywallScreen:alreadyPro") : t("paywallScreen:restoreSuccess"))
      if (isNowPro) await finishPaywall()
    } catch {
      Alert.alert(t("paywallScreen:restoreError"))
    } finally {
      setIsRestoring(false)
    }
  }, [
    isRestoring,
    resolveAppUserId,
    subscriptionStore,
    finishPaywall,
    t,
    authenticationStore.isAuthenticated,
  ])

  return {
    offerings,
    selectedPlan,
    setSelectedPlan,
    isLoadingOfferings,
    isPurchasing,
    isRestoring,
    offeringsError,
    loadOfferings,
    handleSubscribe,
    handleRestore,
  }
}
