import Config from "@/config"
import { useCallback } from "react"
import { Platform } from "react-native"
import { GoogleSignin } from "@react-native-google-signin/google-signin"

let isConfigured = false

function ensureConfigured() {
  if (isConfigured) return
  const { GOOGLE_WEB_CLIENT_ID: webClientId, GOOGLE_IOS_CLIENT_ID: iosClientId } = Config
  if (!webClientId) return
  if (Platform.OS === "ios" && !iosClientId) return

  GoogleSignin.configure({
    webClientId,
    ...(Platform.OS === "ios" ? { iosClientId } : {}),
  })
  isConfigured = true
}

/**
 * Hook that provides Google Sign-In. Configure must be called before signIn (handled in _layout).
 * Returns idToken for backend verification, or null on cancel/error.
 */
export function useGoogleSignIn() {
  const signIn = useCallback(async (): Promise<{ idToken: string } | null> => {
    ensureConfigured()
    try {
      const response = await GoogleSignin.signIn({})
      if (response.type !== "success" || !response.data?.idToken) return null
      return { idToken: response.data.idToken }
    } catch {
      return null
    }
  }, [])

  return { signIn }
}
