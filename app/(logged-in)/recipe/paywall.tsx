import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useStores } from "@/models/helpers/useStores"
import { PRO_ENTITLEMENT_ID } from "@/models/SubscriptionStore"
import type { ThemedStyle } from "@/theme"
import { colors } from "@/theme"
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

export default observer(function PaywallScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const { subscriptionStore } = useStores()

  const [offerings, setOfferings] = useState<PlanOption[]>([])
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  useHeader({
    leftIcon: "back",
    titleTx: "paywallScreen:title",
    onLeftPress: () => router.back(),
  })

  useEffect(() => {
    loadOfferings()
  }, [])

  const loadOfferings = useCallback(async () => {
    setIsLoadingOfferings(true)
    try {
      const Purchases = (await import("react-native-purchases")).default
      const result = await Purchases.getOfferings()
      const current = result.current
      if (!current) {
        setOfferings([])
        return
      }

      const plans: PlanOption[] = []

      if (current.monthly) {
        const product = current.monthly.storeProduct
        plans.push({
          id: current.monthly.identifier,
          period: "monthly",
          title: t("paywallScreen:monthlyLabel"),
          price: product.priceString,
        })
      }

      if (current.annual) {
        const product = current.annual.storeProduct
        let savingsPercent: number | undefined
        if (current.monthly) {
          const monthlyAnnualized = current.monthly.storeProduct.price * 12
          if (monthlyAnnualized > 0) {
            savingsPercent = Math.round((1 - product.price / monthlyAnnualized) * 100)
          }
        }
        plans.push({
          id: current.annual.identifier,
          period: "annual",
          title: t("paywallScreen:annualLabel"),
          price: product.priceString,
          savingsPercent,
        })
      }

      setOfferings(plans)
      // Default to annual if available, else monthly
      const defaultPlan = plans.find((p) => p.period === "annual") ?? plans[0]
      if (defaultPlan) setSelectedPlan(defaultPlan.id)
    } catch (e) {
      console.warn("PaywallScreen: failed to load offerings", e)
      setOfferings([])
    } finally {
      setIsLoadingOfferings(false)
    }
  }, [t])

  const handleSubscribe = useCallback(async () => {
    if (!selectedPlan || isPurchasing) return
    setIsPurchasing(true)
    try {
      const Purchases = (await import("react-native-purchases")).default
      const result = await Purchases.purchasePackage(
        (await Purchases.getOfferings()).current?.availablePackages.find(
          (p) => p.identifier === selectedPlan,
        )!,
      )
      const isNowPro = result.customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
      subscriptionStore.setProp("isPro", isNowPro)
      if (isNowPro) {
        router.back()
      }
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert(t("paywallScreen:purchaseError"))
      }
    } finally {
      setIsPurchasing(false)
    }
  }, [selectedPlan, isPurchasing, subscriptionStore, t])

  const handleRestore = useCallback(async () => {
    if (isRestoring) return
    setIsRestoring(true)
    try {
      const Purchases = (await import("react-native-purchases")).default
      const customerInfo = await Purchases.restorePurchases()
      const isNowPro = customerInfo.entitlements.active[PRO_ENTITLEMENT_ID] !== undefined
      subscriptionStore.setProp("isPro", isNowPro)
      Alert.alert(
        isNowPro ? t("paywallScreen:alreadyPro") : t("paywallScreen:restoreSuccess"),
      )
      if (isNowPro) router.back()
    } catch {
      Alert.alert(t("paywallScreen:restoreError"))
    } finally {
      setIsRestoring(false)
    }
  }, [isRestoring, subscriptionStore, t])

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedHeroSection = useMemo(() => themed($heroSection), [themed])
  const $themedFeatureRow = useMemo(() => themed($featureRow), [themed])
  const $themedPlansRow = useMemo(() => themed($plansRow), [themed])
  const $themedFooter = useMemo(() => themed($footer), [themed])

  return (
    <Screen preset="scroll" contentContainerStyle={$themedContainer}>
      {/* Hero */}
      <View style={$themedHeroSection}>
        <Icon icon="star" size={52} color={colors.palette.accent500} />
        <Text tx="paywallScreen:tagline" preset="heading" style={themed($heroTitle)} />
      </View>

      {/* Feature list */}
      <View style={themed($featureList)}>
        <FeatureRow icon="upload" txKey="paywallScreen:featureImports" />
        <FeatureRow icon="community" txKey="paywallScreen:featureAllMethods" />
        <FeatureRow icon="heart" txKey="paywallScreen:featureSupport" />
      </View>

      {/* Plan picker */}
      {isLoadingOfferings ? (
        <ActivityIndicator
          size="large"
          color={colors.palette.accent500}
          style={themed($loader)}
        />
      ) : offerings.length === 0 ? (
        <Text tx="paywallScreen:noOfferings" style={themed($noOfferings)} />
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

      {/* Subscribe button */}
      <Button
        tx="paywallScreen:subscribeButton"
        onPress={handleSubscribe}
        disabled={!selectedPlan || isPurchasing || isLoadingOfferings}
        style={themed($subscribeButton)}
        textStyle={themed($subscribeButtonText)}
      />

      {/* Footer */}
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

// #region Sub-components

interface FeatureRowProps {
  icon: string
  txKey: string
}

function FeatureRow({ icon, txKey }: FeatureRowProps) {
  const { themed } = useAppTheme()
  return (
    <View style={themed($featureRow)}>
      <Icon icon={icon as any} size={20} color={colors.palette.accent500} />
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

// #endregion

// #region Styles

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.xxl,
  gap: theme.spacing.lg,
})

const $heroSection: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.sm,
  paddingVertical: theme.spacing.md,
})

const $heroTitle: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.text,
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

const $planCardSelected: ThemedStyle<ViewStyle> = () => ({
  borderColor: colors.palette.accent500,
  backgroundColor: colors.palette.accent400 + "22",
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
  backgroundColor: colors.palette.accent500,
  borderRadius: 8,
  paddingHorizontal: theme.spacing.xs,
  paddingVertical: 2,
})

const $savingsBadgeText: ThemedStyle<TextStyle> = () => ({
  fontSize: 11,
  fontWeight: "700",
  color: "#fff",
})

const $subscribeButton: ThemedStyle<ViewStyle> = () => ({
  backgroundColor: colors.palette.accent500,
  borderRadius: 14,
  height: 52,
})

const $subscribeButtonText: ThemedStyle<TextStyle> = () => ({
  color: "#fff",
  fontWeight: "700",
  fontSize: 16,
})

const $loader: ThemedStyle<ViewStyle> = (theme) => ({
  marginVertical: theme.spacing.lg,
})

const $noOfferings: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.textDim,
  marginVertical: theme.spacing.lg,
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
