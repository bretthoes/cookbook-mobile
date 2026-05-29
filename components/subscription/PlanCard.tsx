import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useTranslation } from "react-i18next"
import { TouchableOpacity, View, type TextStyle, type ViewStyle } from "react-native"

export type PlanOption = {
  id: string
  period: "monthly" | "annual"
  title: string
  price: string
  savingsPercent?: number
}

export interface PlanCardProps {
  plan: PlanOption
  isSelected: boolean
  onSelect: () => void
}

export function PlanCard({ plan, isSelected, onSelect }: PlanCardProps) {
  const { themed } = useAppTheme()
  const { t } = useTranslation()

  return (
    <TouchableOpacity
      style={[themed($planCard), isSelected && themed($planCardSelected)]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
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

export { computeAnnualSavingsPercent, parsePriceAmount } from "@/utils/subscription/pricing"

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
