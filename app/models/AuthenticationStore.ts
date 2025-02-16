import { api } from "../services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import * as SecureStore from "expo-secure-store"
import { AuthResultSnapshotIn } from "./AuthResult"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authEmail: "",
    result: "",
  })
  .views((self) => ({
    get isAuthenticated() {
      return !!self.authToken
    },
    get validationError() {
      if (self.authEmail.length === 0) return "can't be blank"
      if (self.authEmail.length < 6) return "must be at least 6 characters"
      if (self.authEmail.length > 99) return "must be less than 100 characters"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(self.authEmail))
        return "must be a valid email address"
      return ""
    }
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setAuthEmail(value: string) {
      store.authEmail = value.replace(/ /g, "")
    },
    setResult(value: string) {
      store.result = value
    },
    async login(password: string) {
      const response = await api.login(store.authEmail, password)
      switch(response.kind) {
        case "ok":
          await this.saveTokens(response.authResult)
          break
        case "unauthorized":
          this.setResult("Email or password is incorrect.")
          break
        case "notallowed":
          this.resendConfirmationEmail()
          break
        default:
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
      this.setResult("")
      const response = await api.register(store.authEmail, password)
      switch(response.kind) {
        case "ok":
          await SecureStore.setItemAsync("password", password)
          break
        case "rejected":
          this.setResult("This email is already taken.")
          break
        default:
          console.error(`Error registering: ${JSON.stringify(response)}`)
          this.setResult("Something went wrong, please try again later.")
      }
    },
    async resendConfirmationEmail() {
      const response = await api.resendConfirmationEmail(store.authEmail)
      if (response.kind === "ok") {
        this.setResult("A confirmation email has been resent.")
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
    async update(displayName: string) {
      const response = await api.updateUser(displayName)
      if (response.kind !== "ok")
        console.error(`Error updating user: ${JSON.stringify(response)}`)
    }
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
