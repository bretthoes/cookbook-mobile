import { useAuthStore } from "@/stores/authStore"
import * as SecureStore from "expo-secure-store"
import { useCallback, useEffect, useRef } from "react"

const POLL_INTERVAL_MS = 8000

/**
 * Polls login while on the email verification step. When the user has clicked
 * the verification link in their email, login will succeed and onVerified is called.
 */
export function useEmailVerificationPolling(isActive: boolean, onVerified: () => void) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkVerification = useCallback(async () => {
    const password = await SecureStore.getItemAsync("password")
    if (!password) return
    const success = await useAuthStore.getState().login(password, true, true)
    if (success) {
      onVerified()
    }
  }, [onVerified])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    checkVerification()
    intervalRef.current = setInterval(checkVerification, POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, checkVerification])

  return null
}
