import { useAuthStore } from "@/stores/authStore"
import { useCallback, useEffect, useRef } from "react"

const POLL_INTERVAL_MS = 8000

/**
 * Polls login while on the email verification step. When the user has clicked
 * the verification link in their email, login will succeed and onVerified is called.
 * The password stays in memory; it is never written to storage.
 */
export function useEmailVerificationPolling(
  isActive: boolean,
  password: string,
  onVerified: () => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const inFlightRef = useRef(false)

  const checkVerification = useCallback(async () => {
    if (!password || inFlightRef.current) return
    inFlightRef.current = true
    try {
      const success = await useAuthStore.getState().login(password, true)
      if (success) onVerified()
    } finally {
      inFlightRef.current = false
    }
  }, [password, onVerified])

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
}
