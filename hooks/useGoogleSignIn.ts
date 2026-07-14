import Config from "@/config"
import { ErrorType, reportCrash } from "@/utils/crashReporting"
import { useCallback } from "react"
import { Platform } from "react-native"
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin"

let isConfigured = false

function ensureConfigured(): boolean {
  if (isConfigured) return true
  const { GOOGLE_WEB_CLIENT_ID: webClientId, GOOGLE_IOS_CLIENT_ID: iosClientId } = Config
  if (!webClientId) {
    reportCrash(
      new Error("Google Sign-In: GOOGLE_WEB_CLIENT_ID is not configured"),
      ErrorType.HANDLED,
    )
    return false
  }
  if (Platform.OS === "ios" && !iosClientId) {
    reportCrash(
      new Error("Google Sign-In: GOOGLE_IOS_CLIENT_ID is not configured"),
      ErrorType.HANDLED,
    )
    return false
  }

  GoogleSignin.configure({
    webClientId,
    ...(Platform.OS === "ios" ? { iosClientId } : {}),
  })
  isConfigured = true
  return true
}

export type GoogleSignInResult =
  | { status: "success"; idToken: string }
  | { status: "cancelled" }
  | { status: "failed"; code?: string; message: string }

function reportGoogleSignInFailure(code: string | undefined, message: string) {
  const error = new Error(message)
  if (code) {
    ;(error as Error & { code?: string }).code = code
  }
  reportCrash(error, ErrorType.HANDLED)
}

/**
 * Hook that provides Google Sign-In.
 * Returns a discriminated result so callers can distinguish cancel from failure.
 */
export function useGoogleSignIn() {
  const signIn = useCallback(async (): Promise<GoogleSignInResult> => {
    if (!ensureConfigured()) {
      return {
        status: "failed",
        code: "NOT_CONFIGURED",
        message: "Google Sign-In is not configured",
      }
    }

    try {
      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
      }

      const response = await GoogleSignin.signIn({})

      if (isSuccessResponse(response)) {
        if (!response.data?.idToken) {
          const message = "Google Sign-In succeeded but idToken was missing"
          reportGoogleSignInFailure("NO_ID_TOKEN", message)
          return { status: "failed", code: "NO_ID_TOKEN", message }
        }
        return { status: "success", idToken: response.data.idToken }
      }

      if (isCancelledResponse(response)) {
        return { status: "cancelled" }
      }

      const message = `Google Sign-In returned unexpected response type: ${response.type}`
      reportGoogleSignInFailure(response.type, message)
      return { status: "failed", code: response.type, message }
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          return { status: "cancelled" }
        }

        const message = `Google Sign-In failed (${error.code}): ${error.message}`
        reportGoogleSignInFailure(String(error.code), message)
        return { status: "failed", code: String(error.code), message }
      }

      const message =
        error instanceof Error ? error.message : "Google Sign-In failed with an unknown error"
      reportGoogleSignInFailure(undefined, message)
      return { status: "failed", message }
    }
  }, [])

  return { signIn }
}
