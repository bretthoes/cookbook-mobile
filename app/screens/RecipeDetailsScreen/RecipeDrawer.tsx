import React from 'react'
import { View, Image, ImageStyle, ViewStyle } from 'react-native'
import { colors, spacing } from 'app/theme'

const logo = require("../../../assets/images/logo.png")

export const RecipeDrawer = () => (
  <View style={[$drawer]}>
    <View style={$logoContainer}>
      <Image source={logo} style={$logoImage} />
    </View>
  </View>
)

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-end",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}
