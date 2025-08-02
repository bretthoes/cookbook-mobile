import React, { ReactNode, useMemo } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Text } from "."
import { colors, spacing, typography } from "../theme"
import { useAppTheme } from "../utils/useAppTheme"
import type { ThemedStyle } from "../theme"
import { TxKeyPath } from "src/i18n"

interface UseCaseProps {
  tx: TxKeyPath
  description?: string
  layout?: "column" | "row"
  children: ReactNode
}

/**
 * @param {UseCaseProps} props - The props for the `UseCase` component.
 * @returns {JSX.Element} The rendered `UseCase` component.
 */
export function UseCase(props: UseCaseProps) {
  const { tx, description, children, layout = "column" } = props
  const { themed } = useAppTheme()

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedItem = useMemo(() => themed($item), [themed])
  const $themedName = useMemo(() => themed($name), [themed])
  const $themedDescription = useMemo(() => themed($description), [themed])

  return (
    <View style={$themedContainer}>
      <Text preset="subheading" style={$themedName} tx={tx} />

      {description && <Text style={$themedDescription}>{description}</Text>}

      <View style={[layout === "row" && $rowLayout, $themedItem]}>{children}</View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
})

const $description: ThemedStyle<TextStyle> = (theme) => ({
  marginTop: theme.spacing.md,
})

const $item: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: 8,
  padding: theme.spacing.lg,
  marginVertical: theme.spacing.md,
})

const $name: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
})

const $rowLayout: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
}
