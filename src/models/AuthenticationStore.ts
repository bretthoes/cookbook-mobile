import { api } from "../services/api"
import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
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
      console.log("fetchDisplayName", store.displayName)
      if (store.displayName) return
      console.log("fetchDisplayName", store.displayName)
      const response = await api.getDisplayName()
      console.log("fetchDisplayName", response)
      if (response.kind === "ok") this.setDisplayName(response.displayName)
      else console.error(`Error fetching display name: ${JSON.stringify(response)}`)
    },
    async updateDisplayName() {
      const response = await api.updateUser(store.displayName)
      if (response.kind !== "ok") {
        console.error(`Error updating user: ${JSON.stringify(response)}`)
        this.setResult("An error occurred. Please try again.")
      } else this.setSubmittedSuccessfully(true)
    },
    setAuthResult(value: AuthResultSnapshotIn) {
      store.authResult = AuthResultModel.create(value)
      store.authToken = value.accessToken
    },
    async saveTokens(authResult: AuthResultSnapshotIn) {
      store.authResult = AuthResultModel.create(authResult)
      store.authToken = authResult.accessToken
      await SecureStore.setItemAsync("accessToken", authResult.accessToken)
      await SecureStore.setItemAsync("refreshToken", authResult.refreshToken)
    },
    async logout() {
      store.authToken = undefined
      store.authEmail = ""
      store.authResult = undefined
      await SecureStore.deleteItemAsync("accessToken")
      await SecureStore.deleteItemAsync("refreshToken")
      await SecureStore.deleteItemAsync("email")
    },
    loadStoredTokens() {
      const accessToken = SecureStore.getItem("accessToken")
      if (accessToken) {
        store.authToken = accessToken
      }
    },
    login: flow(function* (password: string, isFirstLogin = false) {
      store.result = ""
      const response = yield api.login(store.authEmail, password)
      switch (response.kind) {
        case "ok":
          yield SecureStore.setItemAsync("email", store.authEmail)
          store.authResult = AuthResultModel.create(response.authResult)
          store.authToken = response.authResult.accessToken
          yield SecureStore.setItemAsync("accessToken", response.authResult.accessToken)
          yield SecureStore.setItemAsync("refreshToken", response.authResult.refreshToken)
          if (isFirstLogin) {
            yield SecureStore.deleteItemAsync("password")
            if (store.displayName) {
              const updateResponse = yield api.updateUser(store.displayName)
              if (updateResponse.kind !== "ok") {
                console.error(`Error updating user: ${JSON.stringify(updateResponse)}`)
                store.result = "An error occurred. Please Try again."
              } else {
                store.result = "Successfully updated."
              }
            }
          }
          return true
        case "unauthorized":
          store.result = "Email or password is incorrect."
          return false
        case "notallowed":
          const resendResponse = yield api.resendConfirmationEmail(store.authEmail)
          if (resendResponse.kind === "ok") {
            store.result = "A confirmation email has been resent."
          } else {
            store.result = "An error occurred sending email. Please try again."
            console.error(`error in resendConfirmationEmail: ${JSON.stringify(resendResponse)}`)
          }
          return false
        default:
          store.result = "Cannot connect. Please try again later."
          console.error(`Error logging in: ${JSON.stringify(response)}`)
          return false
      }
    }),
    register: flow(function* (password: string) {
      store.result = ""
      const response = yield api.register(store.authEmail, password)
      switch (response.kind) {
        case "ok":
          yield SecureStore.setItemAsync("email", store.authEmail)
          yield SecureStore.setItemAsync("password", password)
          return true
        case "rejected":
          store.result = "This email is already taken."
          return false
        default:
          store.result = "Something went wrong, please try again later."
          console.error(`Error registering: ${JSON.stringify(response)}`)
          return false
      }
    }),
    resendConfirmationEmail: flow(function* () {
      const response = yield api.resendConfirmationEmail(store.authEmail)
      if (response.kind === "ok") {
        store.result = "A confirmation email has been resent."
      } else {
        store.result = "An error occurred sending email. Please try again."
        console.error(`error in resendConfirmationEmail: ${JSON.stringify(response)}`)
      }
    }),
    forgotPassword: flow(function* () {
      const response = yield api.forgotPassword(store.authEmail)
      if (response.kind === "ok") {
        // TODO tell user email is sent
      } else {
        console.error(`Error in forgotPassword: ${JSON.stringify(response)}`)
      }
    }),
    resetPassword: flow(function* (resetCode: string, password: string) {
      const response = yield api.resetPassword(store.authEmail, resetCode, password)
      if (response.kind === "ok") {
        store.result = "Password reset successfully."
      } else {
        store.result = "An error occurred. Please Try again."
        console.error(`Error registering: ${JSON.stringify(response)}`)
      }
    }),
    update: flow(function* () {
      const response = yield api.updateUser(store.displayName)
      if (response.kind !== "ok") {
        console.error(`Error updating user: ${JSON.stringify(response)}`)
        store.result = "An error occurred. Please Try again."
      } else {
        store.result = "Successfully updated."
      }
    }),
  }))

export interface AuthenticationStore extends Instance<typeof AuthenticationStoreModel> {}
export interface AuthenticationStoreSnapshot extends SnapshotOut<typeof AuthenticationStoreModel> {}
