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
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
