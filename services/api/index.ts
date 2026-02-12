/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import Config from "@/config"
import { AuthResultModel, AuthResultSnapshotIn } from "@/models/AuthResult"
import { CookbookSnapshotIn, CookbookSnapshotOut, CookbookToAddSnapshotIn } from "@/models/Cookbook"
import {
  CookbookListSnapshotIn,
  InvitationListSnapshotIn,
  MembershipListSnapshotIn,
  RecipeListSnapshotIn,
} from "@/models/generics"
import { CookbookInvitationStatus, InvitationSnapshotOut } from "@/models/Invitation"
import { MembershipSnapshotOut } from "@/models/Membership"
import { RecipeSnapshotIn, RecipeSnapshotOut, RecipeToAddSnapshotIn } from "@/models/Recipe"
import { GeneralApiProblem, getGeneralApiProblem } from "@/services/api/apiProblem"
import type { ApiConfig } from "@/services/api/types"
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import { ImagePickerAsset } from "expo-image-picker"
import * as SecureStore from "expo-secure-store"

/**
 * Configuring the apisauce instance.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: Config.API_URL,
  timeout: 10000,
}

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  apisauce: ApisauceInstance
  config: ApiConfig
  private onSessionExpired?: () => void

  /**
   * Set up our API instance. Keep this lightweight!
   */
  constructor(config: ApiConfig = DEFAULT_API_CONFIG) {
    this.config = config
    this.apisauce = create({
      baseURL: this.config.url,
      timeout: this.config.timeout,
      headers: {
        Accept: "application/json",
      },
    })
  }

  /**
   * Sets a callback to be called when the session expires and logout is needed.
   * This avoids circular dependencies with the store.
   */
  setSessionExpiredCallback(callback: () => void) {
    this.onSessionExpired = callback
  }

  async setAuthorizationHeader(apisauce: ApisauceInstance) {
    const accessToken = await SecureStore.getItemAsync("accessToken")
    if (accessToken) {
      apisauce.setHeader("Authorization", `Bearer ${accessToken}`)
    }
  }

  /**
   * Gets a list of cookbooks with pagination.
   */
  async getCookbooks(
    pageNumber = 1,
    pageSize = 10,
  ): Promise<{ kind: "ok"; cookbooks: CookbookListSnapshotIn } | GeneralApiProblem> {
    // prepare query parameters
    const params = { PageNumber: pageNumber, PageSize: pageSize }

    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<CookbookListSnapshotIn> = await this.authorizedRequest(
      "Cookbooks",
      "GET",
      params,
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const cookbooks = response.data

      if (cookbooks) return { kind: "ok", cookbooks }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Saves a new cookbook to the database.
   */
  async createCookbook(
    cookbook: CookbookToAddSnapshotIn,
  ): Promise<{ kind: "ok"; cookbookId: number } | GeneralApiProblem> {
    const response: ApiResponse<number> = await this.authorizedRequest("Cookbooks", "POST", {
      title: cookbook.title,
      image: cookbook.image,
    })

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const cookbookId = response.data

      if (cookbookId) return { kind: "ok", cookbookId }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Deletes a single cookbook by its id.
   */
  async deleteCookbook(cookbookId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    // make the API call to delete the cookbook by id
    const response: ApiResponse<CookbookSnapshotOut> = await this.authorizedRequest(
      `Cookbooks/${cookbookId}`,
      "DELETE",
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      return { kind: "ok" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a list of memberships matching a cookbookId with pagination.
   */
  async GetMemberships(
    cookbookId: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ kind: "ok"; memberships: MembershipListSnapshotIn } | GeneralApiProblem> {
    // prepare query parameters
    const params = { CookbookId: cookbookId, PageNumber: pageNumber, PageSize: pageSize }

    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<MembershipListSnapshotIn> = await this.authorizedRequest(
      "Memberships",
      "GET",
      params,
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const memberships = response.data

      if (memberships) return { kind: "ok", memberships }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets the membership by cookbookId.
   */
  async getMembership(
    cookbookId: number,
  ): Promise<{ kind: "ok"; membership: MembershipSnapshotOut } | GeneralApiProblem> {
    // make the API call to get the membership by cookbookId
    const response: ApiResponse<MembershipSnapshotOut> = await this.authorizedRequest(
      `Memberships/by-cookbook/${cookbookId}`,
      "GET",
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const membership = response.data

      if (membership) return { kind: "ok", membership }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a single invitation token by its token.
   */
  async GetInvitationToken(
    token: string,
  ): Promise<{ kind: "ok"; invitation: InvitationSnapshotOut } | GeneralApiProblem> {
    const response: ApiResponse<InvitationSnapshotOut> = await this.authorizedRequest(
      `InvitationTokens/${token}`,
      "GET",
    )
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }
    try {
      const invitation = response.data
      if (invitation) return { kind: "ok", invitation }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a list of invitations.
   */
  async GetInvitations(
    pageNumber: number,
    pageSize: number,
    status: string = "Active",
  ): Promise<{ kind: "ok"; invitations: InvitationListSnapshotIn } | GeneralApiProblem> {
    // prepare query parameters
    const params = { PageNumber: pageNumber, PageSize: pageSize, Status: status }

    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<InvitationListSnapshotIn> = await this.authorizedRequest(
      "Invitations",
      "GET",
      params,
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const invitations = response.data

      if (invitations) return { kind: "ok", invitations }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a count of invitations.
   */
  async GetInvitationCount(): Promise<{ kind: "ok"; count: number } | GeneralApiProblem> {
    // prepare query parameters
    const params = {}

    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<number> = await this.authorizedRequest(
      "Invitations/count",
      "GET",
      params,
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const count = response.data ?? 0

      return { kind: "ok", count }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a list of recipes matching a cookbookId with pagination.
   */
  async getRecipes(
    cookbookId: number,
    search: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ kind: "ok"; recipes: RecipeListSnapshotIn } | GeneralApiProblem> {
    // prepare query parameters
    const params = {
      CookbookId: cookbookId,
      Search: search,
      PageNumber: pageNumber,
      PageSize: pageSize,
    }
    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<RecipeListSnapshotIn> = await this.authorizedRequest(
      "Recipes",
      "GET",
      params,
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const recipes = response.data

      if (recipes) return { kind: "ok", recipes }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets a single recipe by its id.
   */
  async getRecipe(
    recipeId: number,
  ): Promise<{ kind: "ok"; recipe: RecipeSnapshotOut } | GeneralApiProblem> {
    // make the API call to get the recipe by id
    const response: ApiResponse<RecipeSnapshotOut> = await this.authorizedRequest(
      `Recipes/${recipeId}`,
      "GET",
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const recipe = response.data

      if (recipe) return { kind: "ok", recipe }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Deletes a single recipe by its id.
   */
  async deleteRecipe(recipeId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    // make the API call to get the recipe by id
    const response: ApiResponse<RecipeSnapshotOut> = await this.authorizedRequest(
      `Recipes/${recipeId}`,
      "DELETE",
    )

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      return { kind: "ok" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Saves a new recipe to the database.
   */
  async createRecipe(
    recipe: RecipeToAddSnapshotIn,
  ): Promise<{ kind: "ok"; recipeId: number } | GeneralApiProblem> {
    const response: ApiResponse<number> = await this.authorizedRequest("Recipes", "POST", {
      recipe,
    })

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const recipeId = response.data!
      return { kind: "ok", recipeId }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async updateRecipe(
    recipe: RecipeSnapshotIn,
  ): Promise<{ kind: "ok"; recipeId: number } | GeneralApiProblem> {
    const response: ApiResponse<number> = await this.authorizedRequest(
      `Recipes/${recipe.id}`,
      "PUT",
      { Id: recipe.id, Recipe: recipe },
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const recipeId = response.data!
      return { kind: "ok", recipeId }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async createInvite(
    cookbookId: number,
    email: string,
  ): Promise<{ kind: "ok"; token: string } | GeneralApiProblem> {
    const response: ApiResponse<string> = await this.authorizedRequest("Invitations", "POST", {
      email,
      cookbookId,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const token = response.data!
      return { kind: "ok", token: token }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async createInviteToken(
    cookbookId: number,
  ): Promise<{ kind: "ok"; token: string } | GeneralApiProblem> {
    const response: ApiResponse<string> = await this.authorizedRequest("InvitationTokens", "POST", {
      cookbookId,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const token = response.data!
      return { kind: "ok", token: token }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async updateInvite(
    id: number,
    accepted: boolean,
  ): Promise<{ kind: "ok"; invitationId: number } | GeneralApiProblem> {
    const newStatus = accepted
      ? CookbookInvitationStatus.Accepted
      : CookbookInvitationStatus.Rejected

    const response: ApiResponse<number> = await this.authorizedRequest(`Invitations/${id}`, "PUT", {
      Id: id,
      NewStatus: newStatus,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const invitationId = response.data!
      return { kind: "ok", invitationId }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Updates an invitation token by its token string.
   */
  async UpdateInvitationToken(
    token: string,
    accepted: boolean,
  ): Promise<{ kind: "ok"; invitationId: number } | GeneralApiProblem> {
    const newStatus = accepted
      ? CookbookInvitationStatus.Accepted
      : CookbookInvitationStatus.Rejected

    const response: ApiResponse<number> = await this.authorizedRequest(
      `InvitationTokens/${token}`,
      "PUT",
      {
        Token: token,
        NewStatus: newStatus,
      },
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      // The API might return the invitationId or might return nothing (204 No Content)
      // If response is ok, consider it successful even if data is null/undefined
      const invitationId = response.data ?? 0
      return { kind: "ok", invitationId }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      // If response was ok but we can't parse data, still consider it successful
      // since the API call succeeded
      if (response.ok) {
        return { kind: "ok", invitationId: 0 }
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Uploads a collection of images to the server. TODO update method name to plural
   */
  async uploadImage(
    images: ImagePickerAsset[],
  ): Promise<{ kind: "ok"; keys: string[] } | GeneralApiProblem> {
    const formData = new FormData()
    images.forEach((image) => {
      const imageData = {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType,
      } as any
      formData.append("file", imageData)
    })
    const accessToken = await SecureStore.getItemAsync("accessToken")

    const response: ApiResponse<any> = await this.apisauce.post("Images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${accessToken}`,
      },
    })

    // Handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // Process the response and return the uploaded file key
    try {
      const keys = response.data
      return { kind: "ok", keys }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async extractRecipeFromUrl(
    url: string,
  ): Promise<{ kind: "ok"; recipe: RecipeToAddSnapshotIn } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.authorizedRequest(
      "Recipes/parse-recipe-url",
      "POST",
      {
        Url: url,
      },
    )

    // Handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // Process the response and return the uploaded file key
    try {
      const recipe = response.data
      return { kind: "ok", recipe }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async extractRecipeFromImage(
    image: ImagePickerAsset,
  ): Promise<{ kind: "ok"; recipe: RecipeToAddSnapshotIn } | GeneralApiProblem> {
    const formData = new FormData()
    const imageData = {
      uri: image.uri,
      name: image.fileName,
      type: image.mimeType,
    } as any
    formData.append("file", imageData)

    const accessToken = await SecureStore.getItemAsync("accessToken")

    const response: ApiResponse<any> = await this.apisauce.post(
      "Recipes/parse-recipe-img",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${accessToken}`,
        },
      },
    )

    // Handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // Process the response and return the uploaded file key
    try {
      const recipe = response.data
      return { kind: "ok", recipe }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Gets the current user's email.
   */
  async getEmail(): Promise<{ kind: "ok"; email: string } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.authorizedRequest("Users/manage/info", "GET")

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const email = response.data.email

      if (email) return { kind: "ok", email }
      else return { kind: "not-found" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Updates the current user.
   */
  async updateUser(displayName: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.authorizedRequest("/Users/update", "POST", {
      DisplayName: displayName,
    })

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      return { kind: "ok" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Updates the current user.
   */
  async getDisplayName(): Promise<{ kind: "ok"; displayName: string } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.authorizedRequest("/Users/display-name", "GET")

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      const displayName = response.data
      return { kind: "ok", displayName }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Logs in the user with the provided email and password.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ kind: "ok"; authResult: AuthResultSnapshotIn } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<any> = await this.apisauce.post("/Users/login", {
      email,
      password,
    })

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // return the response data
    try {
      if (!response.data) {
        console.error("No data received from login response")
        return { kind: "bad-data" }
      }

      const { tokenType, accessToken, expiresIn, refreshToken } = response.data
      if (!tokenType || !accessToken || !expiresIn || !refreshToken) {
        console.error("Missing required fields in auth response:", response.data)
        return { kind: "bad-data" }
      }

      const authResult = {
        tokenType,
        accessToken,
        expiresIn,
        refreshToken,
      }

      return { kind: "ok", authResult }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async register(email: string, password: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.apisauce.post("/Users/register", {
      email,
      password,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  async resendConfirmationEmail(email: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.apisauce.post("/Users/resendConfirmationEmail", {
      email,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  async forgotPassword(email: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.apisauce.post("/Users/forgotPassword", {
      email,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  async resetPassword(
    email: string,
    resetCode: string,
    newPassword: string,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<any> = await this.apisauce.post("/Users/resetPassword", {
      email,
      resetCode,
      newPassword,
    })

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    return { kind: "ok" }
  }

  async refreshAuthToken() {
    const refreshToken = await SecureStore.getItemAsync("refreshToken")
    if (!refreshToken) throw new Error("No refresh token available")

    const response: ApiResponse<any> = await this.apisauce.post("/Users/refresh", {
      refreshToken,
    })
    if (response.ok) {
      const authResult = AuthResultModel.create(response.data)
      await SecureStore.setItemAsync("accessToken", authResult.accessToken)
      await SecureStore.setItemAsync("refreshToken", authResult.refreshToken)
      return authResult.accessToken
    } else {
      throw new Error("Unable to refresh token")
    }
  }

  async authorizedRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
  ) {
    try {
      await this.setAuthorizationHeader(this.apisauce)
      let response: ApiResponse<any>

      switch (method) {
        case "GET":
          response = await this.apisauce.get(endpoint, body)
          break
        case "POST":
          response = await this.apisauce.post(endpoint, body)
          break
        case "PUT":
          response = await this.apisauce.put(endpoint, body)
          break
        case "DELETE":
          response = await this.apisauce.delete(endpoint, body)
          break
        default:
          throw new Error("Invalid HTTP method")
      }

      // If access token is expired
      if (response.status === 401) {
        // Try to refresh the token
        const newAccessToken = await this.refreshAuthToken()

        if (!newAccessToken) {
          // Log out the user via callback to avoid circular dependencies
          this.onSessionExpired?.()
          throw new Error("Session expired. Please log in again.")
        }

        // Set the new access token and retry the request
        this.apisauce.setHeader("Authorization", `Bearer ${newAccessToken}`)
        switch (method) {
          case "GET":
            return await this.apisauce.get(endpoint, body)
          case "POST":
            return await this.apisauce.post(endpoint, body)
          case "PUT":
            return await this.apisauce.put(endpoint, body)
          case "DELETE":
            return await this.apisauce.delete(endpoint, body)
        }
      }

      return response
    } catch (error) {
      console.error("Request failed:", error)
      throw error
    }
  }

  /**
   * Updates a membership's permissions.
   */
  async updateMembership(
    membershipId: number,
    membership: MembershipSnapshotOut,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<MembershipSnapshotOut> = await this.authorizedRequest(
      `Memberships/${membershipId}`,
      "PUT",
      {
        Id: membershipId,
        isOwner: membership.isOwner,
        CanAddRecipe: membership.canAddRecipe,
        CanUpdateRecipe: membership.canUpdateRecipe,
        CanDeleteRecipe: membership.canDeleteRecipe,
        CanSendInvite: membership.canSendInvite,
        CanRemoveMember: membership.canRemoveMember,
        CanEditCookbookDetails: membership.canEditCookbookDetails,
      },
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      return { kind: "ok" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  /**
   * Deletes a membership.
   */
  async deleteMembership(membershipId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response: ApiResponse<MembershipSnapshotOut> = await this.authorizedRequest(
      `Memberships/${membershipId}`,
      "DELETE",
    )

    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    try {
      return { kind: "ok" }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
  }

  async updateCookbook(cookbook: CookbookSnapshotIn): Promise<{ kind: "ok" } | GeneralApiProblem> {
    try {
      const response = await this.authorizedRequest(`Cookbooks/${cookbook.id}`, "PUT", {
        Id: cookbook.id,
        Title: cookbook.title,
        Image: cookbook.image,
      })

      if (!response.ok) {
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      return { kind: "ok" }
    } catch (error) {
      console.error("Error updating cookbook:", error)
      return { kind: "bad-data" }
    }
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
