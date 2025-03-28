import React, { ReactNode } from "react"
import { TextStyle, View, ViewStyle } from "react-native"
import { Text } from "."
import { colors, spacing, typography } from "../theme"

interface UseCaseProps {
  name?: string
  description?: string
  layout?: "column" | "row"
  children: ReactNode
}

/**
 * @param {UseCaseProps} props - The props for the `UseCase` component.
 * @returns {JSX.Element} The rendered `UseCase` component.
 */
export function UseCase(props: UseCaseProps) {
  const { name, description, children, layout = "column" } = props

  return (
    <View style={$container}>
      <Text preset="subheading" style={$name}>
        {name}
      </Text>

      {description && <Text style={$description}>{description}</Text>}

      <View style={[layout === "row" && $rowLayout, $item]}>{children}</View>
    </View>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
}

const $description: TextStyle = {
  marginTop: spacing.md,
}

const $item: ViewStyle = {
  backgroundColor: colors.backgroundDim,
  borderRadius: 8,
  padding: spacing.lg,
  marginVertical: spacing.md,
}

const $name: TextStyle = {}

const $rowLayout: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
}
