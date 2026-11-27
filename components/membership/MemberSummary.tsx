import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import type { TranslationOptions } from "@/i18n/translate"
import type { ThemedStyle } from "@/theme"
import { useThemedStyles } from "@/theme/useThemedStyles"
import { View, type TextStyle, type ViewStyle } from "react-native"

export interface MemberSummaryProps {
  name: string
  captionTx?: TxKeyPath
  captionTxOptions?: TranslationOptions
}

export function MemberSummary({ name, captionTx, captionTxOptions }: MemberSummaryProps) {
  const $themedContainer = useThemedStyles($container)
  const $themedCaption = useThemedStyles($caption)

  return (
    <View style={$themedContainer}>
      <Text preset="subheading" weight="semiBold" text={name} />
      {captionTx && (
        <Text
          tx={captionTx}
          txOptions={captionTxOptions}
          preset="formHelper"
          style={$themedCaption}
        />
      )}
    </View>
  )
}

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.sm,
  paddingBottom: theme.spacing.md,
})

const $caption: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  marginTop: theme.spacing.sm,
})
