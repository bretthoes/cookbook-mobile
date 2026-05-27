import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useStores } from "@/models/helpers/useStores"
import {
  ensureRevenueCatReady,
  fetchPaywallPlans,
  hasProEntitlement,
  isUserCancelledPurchase,
  type FetchPaywallPlansFailureReason,
} from "@/services/subscription/revenueCat"
import { resolveRevenueCatAppUserId } from "@/utils/resolveRevenueCatAppUserId"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native"

type PlanOption = {
  id: string
  period: "monthly" | "annual"
  title: string
  price: string
  savingsPercent?: number
}

type OfferingsLoadError = FetchPaywallPlansFailureReason | "no_user_id"

export default observer(function PaywallScreen() {
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()
  const { subscriptionStore, authenticationStore } = useStores()

  const [offerings, setOfferings] = useState<PlanOption[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [offeringsError, setOfferingsError] = useState<OfferingsLoadError | null>(null)

  const accentColor = theme.colors.tint

  useHeader({
    leftIcon: "back",
    titleTx: "paywallScreen:title",
    onLeftPress: () => router.back(),
  })

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
      title: t(plan.period === "monthly" ? "paywallScreen:monthlyLabel" : "paywallScreen:annualLabel"),
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
  }, [selectedPlan, isPurchasing, resolveAppUserId, finishPaywall, t, authenticationStore.isAuthenticated])

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
      const Purchases = (await import("react-native-purchases")).default
      const customerInfo = await Purchases.restorePurchases()
      const isNowPro = hasProEntitlement(customerInfo)
      subscriptionStore.setProp("isPro", isNowPro)
      Alert.alert(
        isNowPro ? t("paywallScreen:alreadyPro") : t("paywallScreen:restoreSuccess"),
      )
      if (isNowPro) await finishPaywall()
    } catch {
      Alert.alert(t("paywallScreen:restoreError"))
    } finally {
      setIsRestoring(false)
    }
  }, [isRestoring, resolveAppUserId, subscriptionStore, finishPaywall, t, authenticationStore.isAuthenticated])

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedHeroSection = useMemo(() => themed($heroSection), [themed])
  const $themedPlansRow = useMemo(() => themed($plansRow), [themed])
  const $themedFooter = useMemo(() => themed($footer), [themed])

  return (
    <Screen preset="scroll" contentContainerStyle={$themedContainer}>
      <View style={$themedHeroSection}>
        <Icon icon="heart" size={52} color={accentColor} />
        <Text tx="paywallScreen:tagline" preset="heading" style={themed($heroTitle)} />
        <Text tx="paywallScreen:subtitle" style={themed($heroSubtitle)} />
      </View>

      <View style={themed($featureList)}>
        <FeatureRow icon="upload" txKey="paywallScreen:featureImports" accentColor={accentColor} />
        <FeatureRow
          icon="community"
          txKey="paywallScreen:featureAllMethods"
          accentColor={accentColor}
        />
        <FeatureRow txKey="paywallScreen:featureSupport" />
      </View>

      {isLoadingOfferings ? (
        <ActivityIndicator size="large" color={accentColor} style={themed($loader)} />
      ) : offerings.length === 0 ? (
        <View style={themed($emptyOfferingsBlock)}>
          <Text
            tx={
              offeringsError === "not_configured"
                ? "paywallScreen:noOfferingsNotConfigured"
                : offeringsError === "invalid_api_key"
                  ? "paywallScreen:noOfferingsInvalidApiKey"
                  : offeringsError === "not_logged_in"
                  ? "paywallScreen:noOfferingsNotLoggedIn"
                  : offeringsError === "no_user_id"
                    ? "paywallScreen:noOfferingsNoUserId"
                    : offeringsError === "no_offering" || offeringsError === "no_packages"
                      ? "paywallScreen:noOfferingsDashboard"
                      : "paywallScreen:noOfferings"
            }
            style={themed($noOfferings)}
          />
          <Button
            tx="paywallScreen:retryOfferings"
            onPress={loadOfferings}
            style={themed($retryButton)}
          />
        </View>
      ) : (
        <View style={$themedPlansRow}>
          {offerings.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>
      )}

      <Button
        tx="paywallScreen:subscribeButton"
        onPress={handleSubscribe}
        disabled={!selectedPlan || isPurchasing || isLoadingOfferings}
        style={themed($subscribeButton)}
        textStyle={themed($subscribeButtonText)}
      />

      <View style={$themedFooter}>
        <TouchableOpacity onPress={handleRestore} disabled={isRestoring}>
          <Text
            tx="paywallScreen:restoreButton"
            style={[themed($restoreText), isRestoring && themed($restoreTextDisabled)]}
          />
        </TouchableOpacity>
        <Text tx="paywallScreen:terms" style={themed($termsText)} />
      </View>
    </Screen>
  )
})

interface FeatureRowProps {
  icon?: string
  txKey: string
  accentColor?: string
}

function FeatureRow({ icon, txKey, accentColor }: FeatureRowProps) {
  const { themed } = useAppTheme()
  return (
    <View style={[themed($featureRow), !icon && themed($featureRowTextOnly)]}>
      {icon && accentColor ? (
        <Icon icon={icon as any} size={20} color={accentColor} />
      ) : null}
      <Text tx={txKey as any} style={themed($featureText)} />
    </View>
  )
}

interface PlanCardProps {
  plan: PlanOption
  isSelected: boolean
  onSelect: () => void
}

function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const { themed } = useAppTheme()
  const { t } = useTranslation()

  const cardStyle = useMemo(
    () => [themed($planCard), isSelected && themed($planCardSelected)],
    [themed, isSelected],
  )

  return (
    <TouchableOpacity style={cardStyle} onPress={onSelect} activeOpacity={0.8}>
      {plan.savingsPercent !== undefined && (
        <View style={themed($savingsBadge)}>
          <Text
            text={t("paywallScreen:annualSavings", { percent: plan.savingsPercent })}
            style={themed($savingsBadgeText)}
          />
        </View>
      )}
      <Text text={plan.title} preset="subheading" style={themed($planTitle)} />
      <Text text={plan.price} style={themed($planPrice)} />
    </TouchableOpacity>
  )
}

function computeAnnualSavingsPercent(monthlyPrice: string, annualPrice: string): number | undefined {
  const monthly = parsePriceAmount(monthlyPrice)
  const annual = parsePriceAmount(annualPrice)
  if (monthly === null || annual === null) return undefined
  const monthlyAnnualized = monthly * 12
  if (monthlyAnnualized <= 0) return undefined
  return Math.round((1 - annual / monthlyAnnualized) * 100)
}

function parsePriceAmount(priceString: string): number | null {
  const normalized = priceString.replace(/[^\d.,]/g, "").replace(",", ".")
  const value = Number.parseFloat(normalized)
  return Number.isFinite(value) ? value : null
}

// #region Styles

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.xxl,
  gap: theme.spacing.lg,
})

const $heroSection: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.xs,
  paddingVertical: theme.spacing.md,
})

const $heroTitle: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.text,
})

const $heroSubtitle: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.textDim,
  fontSize: 15,
})

const $featureList: ThemedStyle<ViewStyle> = (theme) => ({
  gap: theme.spacing.sm,
  paddingVertical: theme.spacing.sm,
})

const $featureRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
})

/** Aligns text-only rows with the copy beside icons in other feature rows. */
const $featureRowTextOnly: ThemedStyle<ViewStyle> = (theme) => ({
  paddingLeft: 20 + theme.spacing.sm,
})

const $featureText: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
  fontSize: 15,
  color: theme.colors.text,
})

const $plansRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  gap: theme.spacing.sm,
})

const $planCard: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.md,
  padding: theme.spacing.md,
  alignItems: "center",
  borderWidth: 1.5,
  borderColor: theme.colors.separator,
  gap: theme.spacing.xs,
})

const $planCardSelected: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.tint,
  backgroundColor: theme.colors.palette.primary100,
})

const $planTitle: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
  textAlign: "center",
})

const $planPrice: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 16,
  fontWeight: "700",
  color: theme.colors.text,
  textAlign: "center",
})

const $savingsBadge: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderRadius: 8,
  paddingHorizontal: theme.spacing.xs,
  paddingVertical: 2,
})

const $savingsBadgeText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 11,
  fontWeight: "700",
  color: theme.colors.palette.neutral100,
})

const $subscribeButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderRadius: 14,
  height: 52,
})

const $subscribeButtonText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.neutral100,
  fontWeight: "700",
  fontSize: 16,
})

const $loader: ThemedStyle<ViewStyle> = (theme) => ({
  marginVertical: theme.spacing.lg,
})

const $emptyOfferingsBlock: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.md,
  marginVertical: theme.spacing.lg,
})

const $noOfferings: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.textDim,
  lineHeight: 22,
  paddingHorizontal: theme.spacing.sm,
})

const $retryButton: ThemedStyle<ViewStyle> = (theme) => ({
  minWidth: 160,
  paddingHorizontal: theme.spacing.lg,
})

const $footer: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.sm,
})

const $restoreText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  color: theme.colors.tint,
  textDecorationLine: "underline",
})

const $restoreTextDisabled: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $termsText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 11,
  color: theme.colors.textDim,
  textAlign: "center",
  lineHeight: 16,
})

// #endregion
