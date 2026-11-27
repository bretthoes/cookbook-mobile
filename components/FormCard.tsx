import { useThemedStyles } from "@/theme/useThemedStyles"
import type { ThemedStyle } from "@/theme"
import { ReactNode} from "react"
import { View, ViewStyle } from "react-native"

export interface FormCardProps {
  children: ReactNode
}

/**
 * Minimal card container for form fields. Replaces UseCase for cleaner,
 * production-ready form grouping without demo-style subheadings.
 */
export function FormCard({ children }: FormCardProps) {
  
  const $themedContainer = useThemedStyles($container)

  return <View style={$themedContainer}>{children}</View>
}

// #region Styles
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: 8,
  padding: theme.spacing.lg,
  marginVertical: theme.spacing.md,
  marginHorizontal: theme.spacing.md,
})
// #endregion
