import { api } from "@/services/api"
import { useAuthStore } from "@/stores/authStore"
import { hasChosenDisplayName } from "@/utils/displayName"
import { storage } from "@/utils/storage"
import { router } from "expo-router"
import { useCallback } from "react"

/**
 * Routes a freshly signed-in user. `hasCompletedOnboarding` is per device (theme and font
 * choices), so the display name is checked against the server for the account itself.
 */
export function useNavigateAfterAuth() {
  return useCallback(async () => {
    const response = await api.getDisplayName()
    const needsDisplayName =
      response.kind === "ok" &&
      !hasChosenDisplayName(response.displayName, useAuthStore.getState().authEmail)

    if (!needsDisplayName && storage.getBoolean("hasCompletedOnboarding")) {
      router.replace("/(logged-in)/(tabs)/cookbooks")
      return
    }
    storage.set("onboarding.skipDisplayName", !needsDisplayName)
    router.replace({ pathname: "/(logged-in)/onboarding" as any })
  }, [])
}
