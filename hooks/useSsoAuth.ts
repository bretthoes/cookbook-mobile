import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useFacebookSignIn } from "@/hooks/useFacebookSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"
import { useAuthStore } from "@/stores/authStore"
import { useCallback, useRef, useState } from "react"

/**
 * Runs an SSO provider sign-in, then exchanges the token with the backend.
 * `isSsoLoading` covers only the backend exchange, not the time the user
 * spends in the provider's native sheet.
 */
export function useSsoAuth(onSuccess: () => void) {
  const { signIn: googleSignIn } = useGoogleSignIn()
  const { signIn: appleSignIn } = useAppleSignIn()
  const { signIn: facebookSignIn } = useFacebookSignIn()
  const [isSsoLoading, setIsSsoLoading] = useState(false)
  const inFlightRef = useRef(false)

  const run = useCallback(
    async (getBackendLogin: () => Promise<(() => Promise<boolean>) | null>) => {
      if (inFlightRef.current) return
      inFlightRef.current = true
      try {
        const backendLogin = await getBackendLogin()
        if (!backendLogin) return
        setIsSsoLoading(true)
        if (await backendLogin()) onSuccess()
      } finally {
        inFlightRef.current = false
        setIsSsoLoading(false)
      }
    },
    [onSuccess],
  )

  const signInWithApple = useCallback(() => {
    return run(async () => {
      const result = await appleSignIn()
      if (result.status === "cancelled") return null
      if (result.status !== "success") {
        useAuthStore.getState().setResult("loginScreen:errors.appleFailed")
        return null
      }
      if (result.email) useAuthStore.getState().setAuthEmail(result.email)
      return () => useAuthStore.getState().loginWithApple(result.identityToken)
    })
  }, [run, appleSignIn])

  const signInWithGoogle = useCallback(() => {
    return run(async () => {
      const result = await googleSignIn()
      if (result.status === "cancelled") return null
      if (result.status === "failed") {
        useAuthStore.getState().setResult("loginScreen:errors.googleFailed")
        return null
      }
      return () => useAuthStore.getState().loginWithGoogle(result.idToken)
    })
  }, [run, googleSignIn])

  const signInWithFacebook = useCallback(() => {
    return run(async () => {
      const credential = await facebookSignIn()
      if (!credential) return null
      return () => useAuthStore.getState().loginWithFacebook(credential.accessToken)
    })
  }, [run, facebookSignIn])

  return { isSsoLoading, signInWithApple, signInWithGoogle, signInWithFacebook }
}
