import {
  cookbooksTabTourPhase,
  gettingStartedStepKey,
  type GettingStartedStep,
  type GettingStartedTourPhase,
} from "@/utils/gettingStarted"
import { storage } from "@/utils/storage"
import { router } from "expo-router"
import { useSyncExternalStore } from "react"

export type { GettingStartedTourPhase }

export type GettingStartedTour = {
  step: GettingStartedStep
  phase: GettingStartedTourPhase
}

let tour: GettingStartedTour | null = null
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function getGettingStartedTour(): GettingStartedTour | null {
  return tour
}

export function subscribeGettingStartedTour(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useGettingStartedTour(): GettingStartedTour | null {
  return useSyncExternalStore(
    subscribeGettingStartedTour,
    getGettingStartedTour,
    getGettingStartedTour,
  )
}

export function startGettingStartedTour(step: GettingStartedStep): void {
  tour = { step, phase: cookbooksTabTourPhase(step) }
  emit()
}

export function advanceGettingStartedTour(phase: GettingStartedTourPhase): void {
  if (!tour || tour.phase === phase) return
  tour = { step: tour.step, phase }
  emit()
}

export function endGettingStartedTour(): void {
  if (!tour) return
  tour = null
  emit()
}

function returnToChecklist(): void {
  if (router.canDismiss()) {
    router.dismissTo("/(logged-in)/(tabs)/cookbooks")
    return
  }
  router.navigate("/(logged-in)/(tabs)/cookbooks")
}

/** Marks the current walk done and returns to the checklist. */
export function completeGettingStartedTourToChecklist(userId: string | undefined): void {
  completeGettingStartedTour(userId)
  returnToChecklist()
}

/** Leaves the walk partway and returns to the checklist. The step stays open. */
export function leaveGettingStartedTour(): void {
  endGettingStartedTour()
  returnToChecklist()
}

/** Checks a step off after the real action (a save or a sent invite) and ends its walk in place. */
export function markGettingStartedStepDone(
  userId: string | undefined,
  step: GettingStartedStep,
): void {
  storage.set(gettingStartedStepKey(userId, step), true)
  if (tour?.step === step) endGettingStartedTour()
}

/** Marks the current walk done and leaves the person on its last screen to carry on. */
export function completeGettingStartedTour(userId: string | undefined): void {
  const step = tour?.step
  if (!step) return
  markGettingStartedStepDone(userId, step)
}
