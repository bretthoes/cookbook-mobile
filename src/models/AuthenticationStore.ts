import { api } from "../services/api"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
import * as SecureStore from "expo-secure-store"
import { AuthResultModel, AuthResultSnapshotIn } from "./AuthResult"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const AuthenticationStoreModel = types
  .model("AuthenticationStore")
  .props({
    authToken: types.maybe(types.string),
    authEmail: "",
    result: "",
    displayName: "",
    authResult: types.maybe(AuthResultModel),
    submittedSuccessfully: false,
  })
  .actions(withSetPropAction)
  .views((self) => ({
    get isAuthenticated() {
      return !!self.authToken
    },
    get validationError() {
      if (self.authEmail.length === 0) return "can't be blank"
      if (self.authEmail.length < 6) return "must be at least 6 characters"
      if (self.authEmail.length > 99) return "must be less than 100 characters"
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(self.authEmail)) return "must be a valid email address"
      return ""
    },
  }))
  .actions((store) => ({
    setAuthToken(value?: string) {
      store.authToken = value
    },
    setSubmittedSuccessfully(value: boolean) {
      store.submittedSuccessfully = value
    },
    setAuthEmail(value: string) {
      store.authEmail = value.replace(/ /g, "")
    },
    setResult(value: string) {
      store.result = value
    },
    setDisplayName(value: string) {
      store.displayName = value
    },
    async fetchDisplayName() {
      if (store.displayName) return
      const response = await api.getDisplayName()
      if (response.kind === "ok") this.setDisplayName(response.displayName)
      else console.error(`Error fetching display name: ${JSON.stringify(response)}`)
    },
    async updateDisplayName() {
      const response = await api.updateUser(store.displayName)
      if (response.kind !== "ok") {
        console.error(`Error updating user: ${JSON.stringify(response)}`)
        this.setResult("An error occurred. Please Try again.")
      } else this.setSubmittedSuccessfully(true)
    },
    setAuthResult(value: AuthResultSnapshotIn) {
      store.authResult = AuthResultModel.create(value)
      store.authToken = value.accessToken
    },
    async login(password: string, isFirstLogin = false) {
      const response = await api.login(store.authEmail, password)
      switch (response.kind) {
        case "ok":
          await this.saveTokens(response.authResult)
          if (isFirstLogin) {
            await SecureStore.deleteItemAsync("password")
            if (store.displayName) {
              await this.update()
            }
          }
          break
        case "unauthorized":
          this.setResult("Email or password is incorrect.")
          break
        case "notallowed":
          this.resendConfirmationEmail()
          break
        default:
          this.setResult("Cannot connect. Please try again later.")
          console.error(`Error logging in: ${JSON.stringify(response)}`)
      }
    },
    async saveTokens(authResult: AuthResultSnapshotIn) {
      this.setAuthResult(authResult)
      await SecureStore.setItemAsync("accessToken", authResult.accessToken)
      await SecureStore.setItemAsync("refreshToken", authResult.refreshToken)
    },
    async logout() {
      store.authToken = undefined
      store.authEmail = ""
      store.authResult = undefined
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
      switch (response.kind) {
        case "ok":
          await SecureStore.setItemAsync("password", password)
          break
        case "rejected":
          this.setResult("This email is already taken.")
          break
        default:
          this.setResult("Something went wrong, please try again later.")
          console.error(`Error registering: ${JSON.stringify(response)}`)
      }
    },
    async resendConfirmationEmail() {
      const response = await api.resendConfirmationEmail(store.authEmail)
      if (response.kind === "ok") {
        this.setResult("A confirmation email has been resent.")
      } else {
        this.setResult("An error occurred sending email. Please try again.")
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
        this.setResult("Password reset successfully.")
      } else {
        this.setResult("An error occurred. Please Try again.")
        console.error(`Error registering: ${JSON.stringify(response)}`)
      }
    },
    async update() {
      const response = await api.updateUser(store.displayName)
      if (response.kind !== "ok") {
        console.error(`Error updating user: ${JSON.stringify(response)}`)
        this.setResult("An error occurred. Please Try again.")
      } else this.setResult("Successfully updated.")
    },
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
