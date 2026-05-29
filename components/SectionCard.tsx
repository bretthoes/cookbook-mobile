import { Text } from "@/components/Text"
import { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { ReactNode } from "react"
import { TextStyle, View, ViewStyle } from "react-native"

export interface SectionCardProps {
  headingTx?: TxKeyPath
  descriptionTx?: TxKeyPath
  /** Prefer descriptionTx; plain description is for dynamic copy at call sites only. */
  description?: string
  layout?: "column" | "row"
  children: ReactNode
}

/**
 * Card container for grouped screen content. Replaces the Ignite demo UseCase wrapper.
 */
export function SectionCard(props: SectionCardProps) {
  const { headingTx, descriptionTx, description, children, layout = "column" } = props
  const { themed } = useAppTheme()

  return (
    <View style={themed($container)}>
      {headingTx ? <Text preset="subheading" style={themed($heading)} tx={headingTx} /> : null}

      {descriptionTx ? (
        <Text style={themed($description)} tx={descriptionTx} />
      ) : description ? (
        <Text style={themed($description)} text={description} />
      ) : null}

      <View style={[layout === "row" && $rowLayout, themed($item)]}>{children}</View>
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
})

const $heading: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.text,
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

const $rowLayout: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
}
