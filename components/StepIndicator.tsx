import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { useThemedStyles } from "@/theme/useThemedStyles"
import { useEffect} from "react"
import { LayoutAnimation, View, ViewStyle } from "react-native"

export interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  /** Use "dots" for dot indicators, "text" for "Step X of Y" */
  variant?: "dots" | "text"
}

/**
 * Progress indicator for multi-step flows. Shows current step within total.
 */
export function StepIndicator({ currentStep, totalSteps, variant = "dots" }: StepIndicatorProps) {
  

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }, [currentStep])

  const $themedContainer = useThemedStyles($container)
  const $themedDot = useThemedStyles($dot)
  const $themedDotActive = useThemedStyles($dotActive)

  if (variant === "text") {
    return (
      <View style={$themedContainer} accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}>
        <Text
          tx="registerScreen:stepIndicator"
          txOptions={{ current: currentStep, total: totalSteps }}
          preset="formHelper"
        />
      </View>
    )
  }

  return (
    <View
      style={$themedContainer}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
      accessibilityValue={{ min: 1, max: totalSteps, now: currentStep }}
    >
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[$themedDot, i + 1 === currentStep && $themedDotActive]}
          accessibilityState={{ checked: i + 1 <= currentStep }}
        />
      ))}
    </View>
  )
}

// #region Styles
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.sm,
  marginBottom: theme.spacing.md,
})

const $dot: ThemedStyle<ViewStyle> = (theme) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.colors.border,
})

const $dotActive: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  width: 10,
  height: 10,
  borderRadius: 5,
})
// #endregion
