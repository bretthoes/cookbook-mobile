import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useFacebookSignIn } from "@/hooks/useFacebookSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"
import { useAuthStore } from "@/stores/authStore"
import { useCallback, useState } from "react"

/**
 * Runs an SSO provider sign-in, then exchanges the token with the backend.
 * Shows loading state for the full flow (native sheet + API).
 */
export function useSsoAuth(onSuccess: () => void) {
  const { signIn: googleSignIn } = useGoogleSignIn()
  const { signIn: appleSignIn } = useAppleSignIn()
  const { signIn: facebookSignIn } = useFacebookSignIn()
  const [isSsoLoading, setIsSsoLoading] = useState(false)

  const run = useCallback(
    async (action: () => Promise<boolean>) => {
      setIsSsoLoading(true)
      try {
        if (await action()) onSuccess()
      } finally {
        setIsSsoLoading(false)
      }
    },
    [onSuccess],
  )

  const signInWithApple = useCallback(() => {
    return run(async () => {
      const credential = await appleSignIn()
      if (!credential) return false
      return useAuthStore.getState().loginWithApple(credential.identityToken)
    })
  }, [run, appleSignIn])

  const signInWithGoogle = useCallback(() => {
    return run(async () => {
      const result = await googleSignIn()
      if (result.status === "cancelled") return false
      if (result.status === "failed") {
        useAuthStore.getState().setResult("loginScreen:errors.googleFailed")
        return false
      }
      return useAuthStore.getState().loginWithGoogle(result.idToken)
    })
  }, [run, googleSignIn])

  const signInWithFacebook = useCallback(() => {
    return run(async () => {
      const credential = await facebookSignIn()
      if (!credential) return false
      return useAuthStore.getState().loginWithFacebook(credential.accessToken)
    })
  }, [run, facebookSignIn])

  return { isSsoLoading, signInWithApple, signInWithGoogle, signInWithFacebook }
}
