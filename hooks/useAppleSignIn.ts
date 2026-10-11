import { ErrorType, reportCrash } from "@/utils/crashReporting"
import * as AppleAuthentication from "expo-apple-authentication"
import { useCallback } from "react"
import { Platform } from "react-native"

export type AppleSignInResult =
  | { status: "success"; identityToken: string; email: string | null }
  | { status: "cancelled" }
  | { status: "unavailable" }
  | { status: "failed" }

/**
 * Apple Sign-In (iOS only). Returns the identity token for backend verification.
 * Email is present only the first time the user authorizes the app.
 */
export function useAppleSignIn() {
  const signIn = useCallback(async (): Promise<AppleSignInResult> => {
    if (Platform.OS !== "ios") return { status: "unavailable" }
    const isAvailable = await AppleAuthentication.isAvailableAsync()
    if (!isAvailable) return { status: "unavailable" }
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      })
      if (!credential.identityToken) return { status: "failed" }
      return {
        status: "success",
        identityToken: credential.identityToken,
        email: credential.email,
      }
    } catch (error) {
      if (isAppleCancel(error)) return { status: "cancelled" }
      reportCrash(
        error instanceof Error ? error : new Error("Sign in with Apple failed"),
        ErrorType.HANDLED,
      )
      return { status: "failed" }
    }
  }, [])

  return { signIn }
}

function isAppleCancel(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ERR_REQUEST_CANCELED"
  )
}
