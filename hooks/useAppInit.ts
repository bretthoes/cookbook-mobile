import { setupApp } from "@/stores/setupApp"
import { useEffect, useState } from "react"

export function useAppInit(callback?: () => void | Promise<void>) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let teardown: (() => void) | undefined
    ;(async () => {
      teardown = await setupApp()
      setReady(true)
      if (callback) await callback()
    })()

    return () => {
      teardown?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { ready }
}
