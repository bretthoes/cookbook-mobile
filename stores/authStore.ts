import type { AuthResultSnapshotIn } from "@/types/auth"
import { translate, type TxKeyPath } from "@/i18n"
import { api } from "@/services/api"
import type { ExternalLoginProvider } from "@/services/api/wrappers/users"
import type { GeneralApiProblem } from "@/services/api/apiProblem"
import { bumpAuthSession, setAccessToken } from "@/services/api/client"
import { clearQueryClient } from "@/services/query/queryClient"
import { zustandPersistStorage } from "@/stores/persistStorage"
import { useSubscriptionStore } from "@/stores/subscriptionStore"
import { getAuthEmailValidationTxKey } from "@/utils/authEmailValidation"
import { getRegisterErrorTxKey } from "@/utils/registerErrorTxKey"
import * as SecureStore from "expo-secure-store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const ssoFailureTx = {
  Google: "loginScreen:errors.googleFailed",
  Apple: "loginScreen:errors.appleFailed",
  Facebook: "loginScreen:errors.facebookFailed",
} as const satisfies Record<ExternalLoginProvider, TxKeyPath>

const AUTH_STORE_KEY = "auth-v1"
/** Older builds kept the registration password here until the first login. */
const LEGACY_REGISTER_PASSWORD_KEY = "password"

export function getAuthEmailValidationError(authEmail: string): string {
  const txKey = getAuthEmailValidationTxKey(authEmail)
  return txKey ? translate(txKey) : ""
}

function getEmailSendErrorTxKey(problem: GeneralApiProblem): TxKeyPath {
  return problem.kind === "rate-limited"
    ? "errors:tooManyAttempts"
    : "loginScreen:errors.confirmationResendFailed"
}

async function writeSessionTokens(
  authEmail: string,
  authResult: AuthResultSnapshotIn,
  set: (patch: Partial<AuthState>) => void,
) {
  bumpAuthSession()
  setAccessToken(authResult.accessToken)
  const userId = authEmail.trim() ? authEmail.trim().toLowerCase() : undefined
  set({
    authResult,
    authToken: authResult.accessToken,
    userId,
  })
  await SecureStore.setItemAsync("accessToken", authResult.accessToken)
  await SecureStore.setItemAsync("refreshToken", authResult.refreshToken)
}

async function persistAuthEmail(email: string, set: (patch: Partial<AuthState>) => void) {
  const authEmail = email.replace(/ /g, "")
  if (!authEmail) return
  set({
    authEmail,
    userId: authEmail.trim().toLowerCase(),
  })
  await SecureStore.setItemAsync("email", authEmail)
}

/** Apple omits email after the first authorization, so load it from the account when needed. */
async function ensureAuthEmail(get: () => AuthState, set: (patch: Partial<AuthState>) => void) {
  const existing = get().authEmail.trim()
  if (existing) {
    await SecureStore.setItemAsync("email", existing)
    return
  }
  const response = await api.getEmail()
  if (response.kind === "ok") await persistAuthEmail(response.email, set)
}

export interface AuthState {
  authToken?: string
  userId?: string
  authEmail: string
  result: string
  displayName: string
  authResult?: AuthResultSnapshotIn

  setAuthToken: (value?: string) => void
  setAuthEmail: (value: string) => void
  setResult: (value: string) => void
  fetchDisplayName: () => Promise<string>
  updateDisplayName: (name?: string) => Promise<boolean>
  logout: () => Promise<void>
  /** `silent` (used while waiting for email verification) shows no messages and doesn't resend the confirmation email. */
  login: (password: string, silent?: boolean) => Promise<boolean>
  register: (password: string) => Promise<boolean>
  resendConfirmationEmail: () => Promise<boolean>
  forgotPassword: () => Promise<boolean>
  loginWithProvider: (provider: ExternalLoginProvider, token: string) => Promise<boolean>
  deleteAccount: () => Promise<boolean>
  resetPassword: (resetCode: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authToken: undefined,
      userId: undefined,
      authEmail: "",
      result: "",
      displayName: "",
      authResult: undefined,

      setAuthToken: (value) => {
        setAccessToken(value ?? null)
        set({
          authToken: value,
          userId: value ? get().userId : undefined,
          authResult: value ? get().authResult : undefined,
        })
      },

      setAuthEmail: (value) => {
        const authEmail = value.replace(/ /g, "")
        const patch: Partial<AuthState> = { authEmail }
        if (get().authToken && authEmail.trim()) {
          patch.userId = authEmail.trim().toLowerCase()
        }
        set(patch)
      },

      setResult: (value) => set({ result: value }),

      fetchDisplayName: async () => {
        const response = await api.getDisplayName()
        if (response.kind !== "ok") {
          console.error(`Error fetching display name: ${JSON.stringify(response)}`)
          return get().displayName
        }
        const displayName = response.displayName ?? ""
        set({ displayName })
        return displayName
      },

      updateDisplayName: async (name) => {
        const displayName = name ?? get().displayName
        const response = await api.updateUser(displayName)
        if (response.kind !== "ok") {
          console.error(`Error updating user: ${JSON.stringify(response)}`)
          set({ result: "loginScreen:errors.updateFailed" })
          return false
        }
        set({ displayName })
        return true
      },

      logout: async () => {
        bumpAuthSession()
        clearQueryClient()
        setAccessToken(null)
        set({
          authToken: undefined,
          userId: undefined,
          authEmail: "",
          authResult: undefined,
          displayName: "",
        })
        useSubscriptionStore.getState().reset()
        await SecureStore.deleteItemAsync("accessToken")
        await SecureStore.deleteItemAsync("refreshToken")
        await SecureStore.deleteItemAsync("email")
        await SecureStore.deleteItemAsync(LEGACY_REGISTER_PASSWORD_KEY)
      },

      login: async (password, silent = false) => {
        if (!silent) set({ result: "" })
        const authEmail = get().authEmail
        const response = await api.login(authEmail, password)
        switch (response.kind) {
          case "ok":
            await SecureStore.setItemAsync("email", authEmail)
            await writeSessionTokens(authEmail, response.authResult, set)
            await SecureStore.deleteItemAsync(LEGACY_REGISTER_PASSWORD_KEY)
            return true
          case "unauthorized":
            if (!silent) set({ result: "loginScreen:errors.invalidCredentials" })
            return false
          case "notallowed":
            if (silent) return false
            const resendResponse = await api.resendConfirmationEmail(authEmail)
            if (resendResponse.kind === "ok") {
              set({ result: "loginScreen:errors.confirmationResent" })
            } else {
              set({ result: getEmailSendErrorTxKey(resendResponse) })
              console.error(`error in resendConfirmationEmail: ${JSON.stringify(resendResponse)}`)
            }
            return false
          default:
            if (!silent) set({ result: "loginScreen:errors.cannotConnect" })
            console.error(`Error logging in: ${JSON.stringify(response)}`)
            return false
        }
      },

      register: async (password) => {
        set({ result: "" })
        const authEmail = get().authEmail
        const response = await api.register(authEmail, password)
        if (response.kind === "ok") {
          await SecureStore.setItemAsync("email", authEmail)
          return true
        }
        set({ result: getRegisterErrorTxKey(response) })
        if (response.kind !== "validation") {
          console.error(`Error registering: ${JSON.stringify(response)}`)
        }
        return false
      },

      resendConfirmationEmail: async () => {
        const response = await api.resendConfirmationEmail(get().authEmail)
        if (response.kind === "ok") {
          set({ result: "loginScreen:errors.confirmationResent" })
          return true
        }
        set({ result: getEmailSendErrorTxKey(response) })
        console.error(`error in resendConfirmationEmail: ${JSON.stringify(response)}`)
        return false
      },

      forgotPassword: async () => {
        set({ result: "" })
        const response = await api.forgotPassword(get().authEmail)
        if (response.kind === "ok") return true
        set({ result: getEmailSendErrorTxKey(response) })
        console.error(`Error in forgotPassword: ${JSON.stringify(response)}`)
        return false
      },

      loginWithProvider: async (provider, token) => {
        set({ result: "" })
        const response = await api.loginWithProvider(provider, token)
        if (response.kind !== "ok") {
          set({ result: ssoFailureTx[provider] })
          console.error(`Error logging in with ${provider}: ${JSON.stringify(response)}`)
          return false
        }
        await writeSessionTokens(get().authEmail, response.authResult, set)
        await ensureAuthEmail(get, set)
        return true
      },

      deleteAccount: async () => {
        const response = await api.deleteAccount()
        if (response.kind !== "ok") {
          console.error(`Error deleting account: ${JSON.stringify(response)}`)
          return false
        }
        await get().logout()
        set({ result: "" })
        return true
      },

      resetPassword: async (resetCode, password) => {
        const response = await api.resetPassword(get().authEmail, resetCode, password)
        if (response.kind === "ok") {
          set({ result: "loginScreen:errors.passwordResetSuccess" })
        } else {
          set({ result: "loginScreen:errors.updateFailed" })
          console.error(`Error registering: ${JSON.stringify(response)}`)
        }
      },
    }),
    {
      name: AUTH_STORE_KEY,
      storage: createJSONStorage(() => zustandPersistStorage),
      partialize: (state) => ({
        authEmail: state.authEmail,
        displayName: state.displayName,
        userId: state.userId,
      }),
    },
  ),
)

/** Selector helper for auth guard screens */
export function useIsAuthenticated() {
  return useAuthStore((s) => !!s.authToken)
}
