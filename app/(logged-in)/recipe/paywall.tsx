import { Button } from "@/components/Button"
import { Icon } from "@/components/Icon"
import { FeatureRow } from "@/components/subscription/FeatureRow"
import { PlanCard } from "@/components/subscription/PlanCard"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { usePaywall, type OfferingsLoadError } from "@/hooks/usePaywall"
import type { ThemedStyle } from "@/theme"
import { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import {
  ActivityIndicator,
  Image,
  TouchableOpacity,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native"

const pinterestLogo = require("@/assets/images/pinterest.png")
const tiktokLogo = require("@/assets/images/tiktok.png")
const instagramLogo = require("@/assets/images/instagram.png")
const facebookLogo = require("@/assets/images/facebook.png")

const SOCIAL_LOGOS: ImageSourcePropType[] = [
  pinterestLogo,
  tiktokLogo,
  instagramLogo,
  facebookLogo,
]

function offeringsErrorTxKey(error: OfferingsLoadError | null): TxKeyPath {
  switch (error) {
    case "not_configured":
      return "paywallScreen:noOfferingsNotConfigured"
    case "invalid_api_key":
      return "paywallScreen:noOfferingsInvalidApiKey"
    case "not_logged_in":
      return "paywallScreen:noOfferingsNotLoggedIn"
    case "no_user_id":
      return "paywallScreen:noOfferingsNoUserId"
    case "no_offering":
    case "no_packages":
      return "paywallScreen:noOfferingsDashboard"
    default:
      return "paywallScreen:noOfferings"
  }
}

export default observer(function PaywallScreen() {
  const { themed, theme } = useAppTheme()
  const {
    offerings,
    selectedPlan,
    setSelectedPlan,
    isLoadingOfferings,
    isPurchasing,
    isRestoring,
    offeringsError,
    loadOfferings,
    handleSubscribe,
    handleRestore,
  } = usePaywall()

  const accentColor = theme.colors.tint

  useHeader({
    leftIcon: "back",
    titleTx: "paywallScreen:title",
    onLeftPress: () => router.back(),
  })

  return (
    <Screen preset="scroll" contentContainerStyle={themed($container)}>
      <View style={themed($heroSection)}>
        <Icon icon="heart" size={52} color={accentColor} />
        <Text tx="paywallScreen:tagline" preset="heading" style={themed($heroTitle)} />
        <Text tx="paywallScreen:subtitle" style={themed($heroSubtitle)} />
        <View style={themed($socialLogosRow)}>
          {SOCIAL_LOGOS.map((logo, index) => (
            <Image key={index} source={logo} style={themed($socialLogo)} resizeMode="contain" />
          ))}
        </View>
      </View>

      <View style={themed($featureList)}>
        <FeatureRow icon="upload" txKey="paywallScreen:featureImports" accentColor={accentColor} />
        <FeatureRow
          icon="community"
          txKey="paywallScreen:featureAllMethods"
          accentColor={accentColor}
        />
        <FeatureRow txKey="paywallScreen:featureSupport" />
      </View>

      {isLoadingOfferings ? (
        <ActivityIndicator size="large" color={accentColor} style={themed($loader)} />
      ) : offerings.length === 0 ? (
        <View style={themed($emptyOfferingsBlock)}>
          <Text tx={offeringsErrorTxKey(offeringsError)} style={themed($noOfferings)} />
          <Button tx="paywallScreen:retryOfferings" onPress={loadOfferings} style={themed($retryButton)} />
        </View>
      ) : (
        <View style={themed($plansRow)}>
          {offerings.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.id}
              onSelect={() => setSelectedPlan(plan.id)}
            />
          ))}
        </View>
      )}

      <Button
        tx="paywallScreen:subscribeButton"
        onPress={handleSubscribe}
        disabled={!selectedPlan || isPurchasing || isLoadingOfferings}
        style={themed($subscribeButton)}
        textStyle={themed($subscribeButtonText)}
      />

      <View style={themed($footer)}>
        <TouchableOpacity onPress={handleRestore} disabled={isRestoring}>
          <Text
            tx="paywallScreen:restoreButton"
            style={[themed($restoreText), isRestoring && themed($restoreTextDisabled)]}
          />
        </TouchableOpacity>
        <Text tx="paywallScreen:terms" style={themed($termsText)} />
      </View>
    </Screen>
  )
})

const $container: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.xl,
  paddingBottom: theme.spacing.xxl,
  gap: theme.spacing.lg,
})

const $heroSection: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.xs,
  paddingVertical: theme.spacing.md,
})

const $heroTitle: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.text,
})

const $heroSubtitle: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.textDim,
  fontSize: 15,
})

const $socialLogosRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing.md,
  marginTop: theme.spacing.xs,
})

const $socialLogo: ThemedStyle<ImageStyle> = () => ({
  width: 24,
  height: 24,
})

const $featureList: ThemedStyle<ViewStyle> = (theme) => ({
  gap: theme.spacing.sm,
  paddingVertical: theme.spacing.sm,
})

const $plansRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  gap: theme.spacing.sm,
})

const $subscribeButton: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.tint,
  borderRadius: 14,
  height: 52,
})

const $subscribeButtonText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.palette.neutral100,
  fontWeight: "700",
  fontSize: 16,
})

const $loader: ThemedStyle<ViewStyle> = (theme) => ({
  marginVertical: theme.spacing.lg,
})

const $emptyOfferingsBlock: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.md,
  marginVertical: theme.spacing.lg,
})

const $noOfferings: ThemedStyle<TextStyle> = (theme) => ({
  textAlign: "center",
  color: theme.colors.textDim,
  lineHeight: 22,
  paddingHorizontal: theme.spacing.sm,
})

const $retryButton: ThemedStyle<ViewStyle> = (theme) => ({
  minWidth: 160,
  paddingHorizontal: theme.spacing.lg,
})

const $footer: ThemedStyle<ViewStyle> = (theme) => ({
  alignItems: "center",
  gap: theme.spacing.sm,
})

const $restoreText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 14,
  color: theme.colors.tint,
  textDecorationLine: "underline",
})

const $restoreTextDisabled: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})

const $termsText: ThemedStyle<TextStyle> = (theme) => ({
  fontSize: 11,
  color: theme.colors.textDim,
  textAlign: "center",
  lineHeight: 16,
})
