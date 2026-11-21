import { GettingStartedGuide, useGuideAnchor } from "@/components/cookbooks/GettingStartedGuide"
import { $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { useAuthStore } from "@/stores/authStore"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import {
  advanceGettingStartedTour,
  completeGettingStartedTourToChecklist,
  getGettingStartedTour,
  leaveGettingStartedTour,
  markGettingStartedStepDone,
  useGettingStartedTour,
} from "@/utils/gettingStartedTour"
import { useFocusEffect } from "@react-navigation/native"
import { router, type Href } from "expo-router"
import { useTranslation } from "react-i18next"
import { useCallback, useMemo } from "react"
import { BackHandler, View, type ViewStyle } from "react-native"

export default function AddInvitationOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const userId = useAuthStore((s) => s.userId)
  const tour = useGettingStartedTour()
  const showGuide = tour?.step === "invite" && tour.phase === "options"
  const optionsAnchor = useGuideAnchor(showGuide)

  useFocusEffect(
    useCallback(() => {
      if (getGettingStartedTour()?.step === "invite") advanceGettingStartedTour("options")
    }, []),
  )

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(logged-in)/(tabs)/cookbooks")
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        handleBack()
        return true
      })
      return () => sub.remove()
    }, [handleBack]),
  )

  useHeader({
    leftIcon: "back",
    titleTx: "invitationAddOptionsScreen:title",
    onLeftPress: handleBack,
  })

  const openOption = useCallback(
    (href: Href) => {
      if (getGettingStartedTour()?.step === "invite") markGettingStartedStepDone(userId, "invite")
      router.replace(href)
    },
    [userId],
  )

  const $themedScreenContainer = useMemo(() => themed($screenContainer), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <View style={$root}>
      <Screen preset="scroll" contentContainerStyle={$themedScreenContainer}>
        <View
          ref={optionsAnchor.ref}
          onLayout={optionsAnchor.onLayout}
          collapsable={false}
          style={$themedListContainer}
        >
          <OptionListItem
            title={t("invitationAddOptionsScreen:inviteByEmail")}
            description={t("invitationAddOptionsScreen:inviteByEmailDesc")}
            leftIcon="mail"
            onPress={() => openOption("../invitation/add-email")}
          />
          <OptionListItem
            title={t("invitationAddOptionsScreen:inviteByLink")}
            description={t("invitationAddOptionsScreen:inviteByLinkDesc")}
            leftIcon="web"
            onPress={() => openOption("../invitation/add-link")}
          />
        </View>
      </Screen>
      {showGuide ? (
        <GettingStartedGuide
          messageTx="gettingStarted:guideInviteOptions"
          primaryTx="gettingStarted:gotIt"
          target={optionsAnchor.target}
          onPrimary={() => completeGettingStartedTourToChecklist(userId)}
          onClose={leaveGettingStartedTour}
        />
      ) : null}
    </View>
  )
}

const $root: ViewStyle = {
  flex: 1,
}

const $screenContainer: ThemedStyle<ViewStyle> = (theme) => ({
  paddingTop: theme.spacing.sm,
})
