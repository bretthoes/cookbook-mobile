import { useAppleSignIn } from "@/hooks/useAppleSignIn"
import { useFacebookSignIn } from "@/hooks/useFacebookSignIn"
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn"
import { useStores } from "@/models/helpers/useStores"
import { useCallback, useState } from "react"

/**
 * Runs an SSO provider sign-in, then exchanges the token with the backend.
 * Shows loading state for the full flow (native sheet + API).
 */
export function useSsoAuth(onSuccess: () => void) {
  const { signIn: googleSignIn } = useGoogleSignIn()
  const { signIn: appleSignIn } = useAppleSignIn()
  const { signIn: facebookSignIn } = useFacebookSignIn()
  const { authenticationStore } = useStores()
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
      return authenticationStore.loginWithApple(credential.identityToken)
    })
  }, [run, appleSignIn, authenticationStore])

  const signInWithGoogle = useCallback(() => {
    return run(async () => {
      const credential = await googleSignIn()
      if (!credential) return false
      return authenticationStore.loginWithGoogle(credential.idToken)
    })
  }, [run, googleSignIn, authenticationStore])

  const signInWithFacebook = useCallback(() => {
    return run(async () => {
      const credential = await facebookSignIn()
      if (!credential) return false
      return authenticationStore.loginWithFacebook(credential.accessToken)
    })
  }, [run, facebookSignIn, authenticationStore])

  return { isSsoLoading, signInWithApple, signInWithGoogle, signInWithFacebook }
}
