import * as AppleAuthentication from "expo-apple-authentication"
import { useCallback } from "react"
import { Platform } from "react-native"

/**
 * Hook that provides Apple Sign-In (iOS only).
 * Returns identityToken for backend verification, or null on cancel/error/unsupported.
 */
export function useAppleSignIn() {
  const signIn = useCallback(async (): Promise<{ identityToken: string } | null> => {
    if (Platform.OS !== "ios") return null
    const isAvailable = await AppleAuthentication.isAvailableAsync()
    if (!isAvailable) return null
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!credential.identityToken) return null
      return { identityToken: credential.identityToken }
    } catch {
      return null
    }
  }, [])

  return { signIn }
}
