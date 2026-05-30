import type { AuthResultSnapshotIn } from "@/types/auth"
import { api } from "@/services/api"
import { bumpAuthSession, setAccessToken } from "@/services/api/client"
import { clearQueryClient } from "@/services/query/queryClient"
import { zustandPersistStorage } from "@/stores/persistStorage"
import { useSubscriptionStore } from "@/stores/subscriptionStore"
import * as SecureStore from "expo-secure-store"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

const AUTH_STORE_KEY = "auth-v1"

export function getAuthEmailValidationError(authEmail: string): string {
  if (authEmail.length === 0) return "can't be blank"
  if (authEmail.length < 6) return "must be at least 6 characters"
  if (authEmail.length > 99) return "must be less than 100 characters"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
  return ""
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

export interface AuthState {
  authToken?: string
  userId?: string
  authEmail: string
  result: string
  displayName: string
  authResult?: AuthResultSnapshotIn
  submittedSuccessfully: boolean

  setAuthToken: (value?: string) => void
  setSubmittedSuccessfully: (value: boolean) => void
  setAuthEmail: (value: string) => void
  setResult: (value: string) => void
  setDisplayName: (value: string) => void
  fetchDisplayName: () => Promise<void>
  updateDisplayName: (name?: string) => Promise<boolean>
  setAuthResult: (value: AuthResultSnapshotIn) => void
  logout: () => Promise<void>
  login: (password: string, isFirstLogin?: boolean, silent?: boolean) => Promise<boolean>
  register: (password: string) => Promise<boolean>
  resendConfirmationEmail: () => Promise<void>
  forgotPassword: () => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<boolean>
  loginWithApple: (identityToken: string) => Promise<boolean>
  loginWithFacebook: (accessToken: string) => Promise<boolean>
  resetPassword: (resetCode: string, password: string) => Promise<void>
  update: () => Promise<void>
  saveTokens: (authResult: AuthResultSnapshotIn) => Promise<void>
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
      submittedSuccessfully: false,

      setAuthToken: (value) => {
        setAccessToken(value ?? null)
        set({
          authToken: value,
          userId: value ? get().userId : undefined,
          authResult: value ? get().authResult : undefined,
        })
      },

      setSubmittedSuccessfully: (value) => set({ submittedSuccessfully: value }),

      setAuthEmail: (value) => {
        const authEmail = value.replace(/ /g, "")
        const patch: Partial<AuthState> = { authEmail }
        if (get().authToken && authEmail.trim()) {
          patch.userId = authEmail.trim().toLowerCase()
        }
        set(patch)
      },

      setResult: (value) => set({ result: value }),

      setDisplayName: (value) => set({ displayName: value }),

      fetchDisplayName: async () => {
        if (get().displayName) return
        const response = await api.getDisplayName()
        if (response.kind === "ok") set({ displayName: response.displayName ?? "" })
        else console.error(`Error fetching display name: ${JSON.stringify(response)}`)
      },

      updateDisplayName: async (name) => {
        const displayName = name ?? get().displayName
        const response = await api.updateUser(displayName)
        if (response.kind !== "ok") {
          console.error(`Error updating user: ${JSON.stringify(response)}`)
          set({ result: "loginScreen:errors.updateFailed" })
          return false
        }
        set({ displayName, submittedSuccessfully: true })
        return true
      },

      setAuthResult: (value) => {
        setAccessToken(value.accessToken)
        const authEmail = get().authEmail
        set({
          authResult: value,
          authToken: value.accessToken,
          userId: authEmail.trim() ? authEmail.trim().toLowerCase() : undefined,
        })
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
        })
        useSubscriptionStore.getState().reset()
        await SecureStore.deleteItemAsync("accessToken")
        await SecureStore.deleteItemAsync("refreshToken")
        await SecureStore.deleteItemAsync("email")
      },

      login: async (password, isFirstLogin = false, silent = false) => {
        if (!silent) set({ result: "" })
        const authEmail = get().authEmail
        const response = await api.login(authEmail, password)
        switch (response.kind) {
          case "ok":
            await SecureStore.setItemAsync("email", authEmail)
            await writeSessionTokens(authEmail, response.authResult, set)
            if (isFirstLogin) {
              await SecureStore.deleteItemAsync("password")
              if (get().displayName) {
                const updateResponse = await api.updateUser(get().displayName)
                if (updateResponse.kind !== "ok") {
                  console.error(`Error updating user: ${JSON.stringify(updateResponse)}`)
                  set({ result: "loginScreen:errors.updateFailed" })
                } else {
                  set({ result: "loginScreen:errors.updateSuccess" })
                }
              }
            }
            return true
          case "unauthorized":
            if (!silent) set({ result: "loginScreen:errors.invalidCredentials" })
            return false
          case "notallowed":
            if (isFirstLogin) return false
            const resendResponse = await api.resendConfirmationEmail(authEmail)
            if (resendResponse.kind === "ok") {
              set({ result: "loginScreen:errors.confirmationResent" })
            } else {
              set({ result: "loginScreen:errors.confirmationResendFailed" })
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
        switch (response.kind) {
          case "ok":
            await SecureStore.setItemAsync("email", authEmail)
            await SecureStore.setItemAsync("password", password)
            return true
          case "rejected":
            set({ result: "registerScreen:errors.emailTaken" })
            return false
          default:
            set({ result: "registerScreen:errors.generic" })
            console.error(`Error registering: ${JSON.stringify(response)}`)
            return false
        }
      },

      resendConfirmationEmail: async () => {
        const response = await api.resendConfirmationEmail(get().authEmail)
        if (response.kind === "ok") {
          set({ result: "loginScreen:errors.confirmationResent" })
        } else {
          set({ result: "loginScreen:errors.confirmationResendFailed" })
          console.error(`error in resendConfirmationEmail: ${JSON.stringify(response)}`)
        }
      },

      forgotPassword: async () => {
        const response = await api.forgotPassword(get().authEmail)
        if (response.kind !== "ok") {
          console.error(`Error in forgotPassword: ${JSON.stringify(response)}`)
        }
      },

      loginWithGoogle: async (idToken) => {
        set({ result: "" })
        const response = await api.loginWithGoogle(idToken)
        if (response.kind !== "ok") {
          set({ result: "loginScreen:errors.googleFailed" })
          console.error(`Error logging in with Google: ${JSON.stringify(response)}`)
          return false
        }
        await writeSessionTokens(get().authEmail, response.authResult, set)
        return true
      },

      loginWithApple: async (identityToken) => {
        set({ result: "" })
        const response = await api.loginWithApple(identityToken)
        if (response.kind !== "ok") {
          set({ result: "loginScreen:errors.appleFailed" })
          console.error(`Error logging in with Apple: ${JSON.stringify(response)}`)
          return false
        }
        await writeSessionTokens(get().authEmail, response.authResult, set)
        return true
      },

      loginWithFacebook: async (accessToken) => {
        set({ result: "" })
        const response = await api.loginWithFacebook(accessToken)
        if (response.kind !== "ok") {
          set({ result: "loginScreen:errors.facebookFailed" })
          console.error(`Error logging in with Facebook: ${JSON.stringify(response)}`)
          return false
        }
        await writeSessionTokens(get().authEmail, response.authResult, set)
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

      update: async () => {
        const response = await api.updateUser(get().displayName)
        if (response.kind !== "ok") {
          console.error(`Error updating user: ${JSON.stringify(response)}`)
          set({ result: "loginScreen:errors.updateFailed" })
        } else {
          set({ result: "loginScreen:errors.updateSuccess" })
        }
      },

      saveTokens: async (authResult) => {
        await writeSessionTokens(get().authEmail, authResult, set)
      },
    }),
    {
      name: AUTH_STORE_KEY,
      storage: createJSONStorage(() => zustandPersistStorage),
      partialize: (state) => ({
        authEmail: state.authEmail,
        displayName: state.displayName,
        userId: state.userId,
        submittedSuccessfully: state.submittedSuccessfully,
      }),
    },
  ),
)

/** Selector helper for auth guard screens */
export function useIsAuthenticated() {
  return useAuthStore((s) => !!s.authToken)
}
