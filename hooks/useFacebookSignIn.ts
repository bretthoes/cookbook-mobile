import { useCallback } from "react"
import { AccessToken, LoginManager } from "react-native-fbsdk-next"

/**
 * Hook that provides Facebook Sign-In (iOS and Android).
 * Returns accessToken for backend verification, or null on cancel/error/not-configured.
 */
export function useFacebookSignIn() {
  const signIn = useCallback(async (): Promise<{ accessToken: string } | null> => {
    try {
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"])
      if (result.isCancelled) return null

      const tokenData = await AccessToken.getCurrentAccessToken()
      if (!tokenData?.accessToken) return null

      return { accessToken: tokenData.accessToken }
    } catch {
      return null
    }
  }, [])

  return { signIn }
}
