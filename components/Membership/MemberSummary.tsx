import { Text } from "@/components/Text"
import type { TxKeyPath } from "@/i18n"
import type { TranslationOptions } from "@/i18n/translate"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useMemo } from "react"
import { View, type TextStyle, type ViewStyle } from "react-native"

export interface MemberSummaryProps {
  name: string
  captionTx?: TxKeyPath
  captionTxOptions?: TranslationOptions
}

export function MemberSummary({ name, captionTx, captionTxOptions }: MemberSummaryProps) {
  const { themed } = useAppTheme()
  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedCaption = useMemo(() => themed($caption), [themed])

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
