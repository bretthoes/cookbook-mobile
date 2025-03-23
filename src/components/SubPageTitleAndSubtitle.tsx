import React from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "./Text"
import { Divider } from "./Divider"
import { spacing } from "src/theme"
import { TxKeyPath } from "src/i18n"
import { TOptions } from "i18next"

interface SubPageTitleAndSubtitleProps {
  title?: string
  titleTx?: TxKeyPath
  titleTxOptions?: TOptions
  subtitle?: string
  subtitleTx?: TxKeyPath
  subtitleTxOptions?: TOptions
  style?: ViewStyle
}

export function SubPageTitleAndSubtitle({ 
  title,
  titleTx,
  titleTxOptions,
  subtitle,
  subtitleTx,
  subtitleTxOptions,
  style 
}: SubPageTitleAndSubtitleProps) {
  return (
    <View style={[$headerContainer, style]}>
      <Text preset="subheading" text={title} tx={titleTx} txOptions={titleTxOptions} />
      {(subtitle || subtitleTx) && (
        <>
          <Text text={subtitle} tx={subtitleTx} txOptions={subtitleTxOptions} />
        </>
      )}
    </View>
  )
}

const $headerContainer: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.lg,
} 