import React, { FC } from "react"
import { Image, ImageStyle, TextStyle, View, ViewStyle } from "react-native"
import { ListItem, Screen, Text } from "../components"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { spacing } from "../theme"
import { isRTL } from "../i18n"
import { useNavigation } from "@react-navigation/native"

const chainReactLogo = require("../../assets/images/demo/cr-logo.png")
const reactNativeLiveLogo = require("../../assets/images/demo/rnl-logo.png")
const reactNativeRadioLogo = require("../../assets/images/demo/rnr-logo.png")
const reactNativeNewsletterLogo = require("../../assets/images/demo/rnn-logo.png")

export const DemoCommunityScreen: FC<DemoTabScreenProps<"DemoCommunity">> =
  function DemoCommunityScreen(_props) {
    const navigation = useNavigation<DemoTabScreenProps<"DemoCommunity">["navigation"]>()
    const handleInviteNavigation = () => {
      navigation.navigate("InvitationsList")
    }

    return (
      <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top"]}>
        <Text preset="heading" text="All things social on the app" style={$title} />

        <Text text="Check out invites, notifications, and more." style={$description} />
        <ListItem
          text="View your pending invites"
          onPress={handleInviteNavigation}
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          LeftComponent={
            <View style={$logoContainer}>
              <Image source={reactNativeRadioLogo} style={$logo} />
            </View>
          }
        />
        <ListItem
          text="See new additions in your cookbooks"
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          LeftComponent={
            <View style={$logoContainer}>
              <Image source={reactNativeNewsletterLogo} style={$logo} />
            </View>
          }
        />
        <ListItem
          text="Check out what's popular"
          bottomSeparator
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          LeftComponent={
            <View style={$logoContainer}>
              <Image source={reactNativeLiveLogo} style={$logo} />
            </View>
          }
        />
        <ListItem
          text="Share feedback about the app"
          rightIcon={isRTL ? "caretLeft" : "caretRight"}
          LeftComponent={
            <View style={$logoContainer}>
              <Image source={chainReactLogo} style={$logo} />
            </View>
          }
        />
      </Screen>
    )
  }

const $container: ViewStyle = {
  paddingTop: spacing.lg + spacing.xl,
  paddingHorizontal: spacing.lg,
}

const $title: TextStyle = {
  marginBottom: spacing.sm,
}

const $description: TextStyle = {
  marginBottom: spacing.lg,
}

const $logoContainer: ViewStyle = {
  marginEnd: spacing.md,
  flexDirection: "row",
  flexWrap: "wrap",
  alignContent: "center",
  alignSelf: "stretch",
}

const $logo: ImageStyle = {
  height: 38,
  width: 38,
}
