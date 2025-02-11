import { api } from "../services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import * as SecureStore from "expo-secure-store"
import { AuthResultSnapshotIn } from "./AuthResult"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authEmail: "",
  })
  .views((store) => ({
    get isAuthenticated() {
      return !!store.authToken
    },
    get validationError() {
      if (store.authEmail.length === 0) return "can't be blank"
      if (store.authEmail.length < 6) return "must be at least 6 characters"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(store.authEmail))
        return "must be a valid email address"
      return ""
    },
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setAuthEmail(value: string) {
      store.authEmail = value.replace(/ /g, "")
    },
    async login(password: string) {
      const response = await api.login(store.authEmail, password)
      if (response.kind === "ok") {
        await this.saveTokens(response.authResult)
      } else {
        console.error(`Error logging in: ${JSON.stringify(response)}`)
      }
    },
    async saveTokens(authResult: AuthResultSnapshotIn) {
      await SecureStore.setItemAsync("accessToken", authResult.accessToken)
      await SecureStore.setItemAsync("refreshToken", authResult.refreshToken)
      this.setAuthToken(authResult.accessToken)
    },
    async logout() {
      store.authToken = undefined
      store.authEmail = ""
      await SecureStore.deleteItemAsync("accessToken")
      await SecureStore.deleteItemAsync("refreshToken")
    },
    loadStoredTokens() {
      const accessToken = SecureStore.getItem("accessToken")
      if (accessToken) {
        this.setAuthToken(accessToken)
      }
    },
    async register(password: string) {
      const response = await api.register(store.authEmail, password)
      if (response.kind === "ok") {
        // TODO redirect to email confirmation page
      } else {
        console.error(`Error registering: ${JSON.stringify(response)}`)
      }
    },
    async resendConfirmationEmail() {
      const response = await api.resendConfirmationEmail(store.authEmail)
      if (response.kind === "ok") {
        // TODO tell user email is sent
      } else {
        console.error(`error in resendConfirmationEmail: ${JSON.stringify(response)}`)
      }
    },
    async forgotPassword() {
      const response = await api.forgotPassword(store.authEmail)
      if (response.kind === "ok") {
        // TODO tell user email is sent
      } else {
        console.error(`Error in forgotPassword: ${JSON.stringify(response)}`)
      }
    },
    async resetPassword(resetCode: string, password: string) {
      const response = await api.resetPassword(store.authEmail, resetCode, password)
      if (response.kind === "ok") {
        // TODO redirect to login page
      } else {
        console.error(`Error registering: ${JSON.stringify(response)}`)
      }
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
