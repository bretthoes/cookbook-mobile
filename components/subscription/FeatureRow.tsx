import { Icon, IconTypes } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { View, type TextStyle, type ViewStyle } from "react-native"

export interface FeatureRowProps {
  icon?: IconTypes
  txKey: TxKeyPath
  accentColor?: string
}

export function FeatureRow({ icon, txKey, accentColor }: FeatureRowProps) {
  const { themed } = useAppTheme()
  return (
    <View style={[themed($featureRow), !icon && themed($featureRowTextOnly)]}>
      {icon && accentColor ? <Icon icon={icon} size={20} color={accentColor} /> : null}
      <Text tx={txKey} style={themed($featureText)} />
    </View>
  )
}

const $featureRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
})

const $featureRowTextOnly: ThemedStyle<ViewStyle> = (theme) => ({
  paddingLeft: 20 + theme.spacing.sm,
})

const $featureText: ThemedStyle<TextStyle> = (theme) => ({
  flex: 1,
  fontSize: 15,
  color: theme.colors.text,
})
