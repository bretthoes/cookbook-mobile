import { useGuideAnchor } from "@/components/cookbooks/GettingStartedGuide"
import type { TxKeyPath } from "@/i18n"
import { useAuthStore } from "@/stores/authStore"
import { cookbookDetailTourPhase, cookbooksTabTourPhase } from "@/utils/gettingStarted"
import {
  advanceGettingStartedTour,
  completeGettingStartedTour,
  endGettingStartedTour,
  getGettingStartedTour,
  leaveGettingStartedTour,
  markGettingStartedStepDone,
  useGettingStartedTour,
} from "@/utils/gettingStartedTour"
import { useFocusEffect, useIsFocused } from "expo-router/react-navigation"
import { useCallback } from "react"

export function useCookbookDetailTour(canContribute: boolean, canInvite: boolean) {
  const isFocused = useIsFocused()
  const tour = useGettingStartedTour()
  const showFabGuide = isFocused && tour?.step === "recipe" && tour.phase === "fab"
  const showMenuGuide = isFocused && tour?.step === "invite" && tour.phase === "menu"
  const fabAnchor = useGuideAnchor(showFabGuide && canContribute)
  const menuAnchor = useGuideAnchor(showMenuGuide && canInvite)

  useFocusEffect(
    useCallback(() => {
      const current = getGettingStartedTour()
      const phase = current ? cookbookDetailTourPhase(current.step) : null
      if (phase) advanceGettingStartedTour(phase)
    }, []),
  )

  return {
    showFabGuide,
    showMenuGuide,
    fabAnchor,
    menuAnchor,
    leaveTour: leaveGettingStartedTour,
  }
}

export function useRecipeOptionsTour() {
  const tour = useGettingStartedTour()
  const active = tour?.step === "recipe" && tour.phase === "options"
  const manualAnchor = useGuideAnchor(active)

  useFocusEffect(
    useCallback(() => {
      if (getGettingStartedTour()?.step === "recipe") advanceGettingStartedTour("options")
    }, []),
  )

  return { active, manualAnchor, leaveTour: leaveGettingStartedTour }
}

export function useAddRecipeTour() {
  const tour = useGettingStartedTour()
  const userId = useAuthStore((s) => s.userId)
  const active = tour?.step === "recipe" && tour.phase === "screen"

  useFocusEffect(
    useCallback(() => {
      if (getGettingStartedTour()?.step === "recipe") advanceGettingStartedTour("screen")
    }, []),
  )

  const complete = useCallback(() => completeGettingStartedTour(userId), [userId])
  const markDone = useCallback(() => markGettingStartedStepDone(userId, "recipe"), [userId])

  return { active, complete, dismiss: endGettingStartedTour, markDone }
}

export function useCookbooksTabTour() {
  const isFocused = useIsFocused()
  const tour = useGettingStartedTour()
  const showFabGuide = isFocused && tour?.step === "cookbook" && tour.phase === "fab"
  const showChooseGuide = isFocused && tour?.phase === "choose"
  const fabAnchor = useGuideAnchor(showFabGuide)
  const firstCookbookAnchor = useGuideAnchor(showChooseGuide)
  const chooseMessageTx: TxKeyPath =
    tour?.step === "invite"
      ? "gettingStarted:guideInviteChoose"
      : "gettingStarted:guideRecipeChoose"

  useFocusEffect(
    useCallback(() => {
      const current = getGettingStartedTour()
      if (current) advanceGettingStartedTour(cookbooksTabTourPhase(current.step))
    }, []),
  )

  return {
    showFabGuide,
    showChooseGuide,
    fabAnchor,
    firstCookbookAnchor,
    chooseMessageTx,
    leaveTour: leaveGettingStartedTour,
  }
}
