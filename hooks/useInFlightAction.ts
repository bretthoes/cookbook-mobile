import { useCallback, useRef, useState } from "react"

/**
 * Prevents overlapping async actions (e.g. spam-tapping Save).
 * Returns whether the action ran; skipped invocations return false.
 */
export function useInFlightAction() {
  const inFlightRef = useRef(false)
  const [isInFlight, setIsInFlight] = useState(false)

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (inFlightRef.current) return undefined
    inFlightRef.current = true
    setIsInFlight(true)
    try {
      return await action()
    } finally {
      inFlightRef.current = false
      setIsInFlight(false)
    }
  }, [])

  return { isInFlight, run }
}
