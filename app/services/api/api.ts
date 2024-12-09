/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { ApiResponse, ApisauceInstance, create } from "apisauce"
import Config from "../../config"
import { GeneralApiProblem, getGeneralApiProblem } from "./apiProblem"
import type { ApiConfig, ApiFeedResponse } from "./api.types"
import type { EpisodeSnapshotIn } from "../../models/Episode"
import { AuthResultModel, AuthResultSnapshotIn } from "../../models/AuthResult"
import * as SecureStore from "expo-secure-store"
import { CookbookToAddSnapshotIn } from "app/models/Cookbook"
import { RecipeSnapshotOut, RecipeToAddSnapshotIn } from "app/models/Recipe"
import { ImagePickerAsset } from "expo-image-picker"
import { CookbookListSnapshotIn, MembershipListSnapshotIn, InvitationListSnapshotIn, RecipeListSnapshotIn } from "app/models/generics/PaginatedList"
import { CookbookInvitationStatus } from "app/models"

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

  async setAuthorizationHeader(apisauce: ApisauceInstance) {
    const accessToken = await SecureStore.getItemAsync("accessToken")
    if (accessToken) {
      apisauce.setHeader("Authorization", `Bearer ${accessToken}`)
    }
  }

  /**
   * Gets a list of recent React Native Radio episodes.
   */
  async getEpisodes(): Promise<{ kind: "ok"; episodes: EpisodeSnapshotIn[] } | GeneralApiProblem> {
    // make the api call
    const response: ApiResponse<ApiFeedResponse> = await this.apisauce.get(
      `api.json?rss_url=https%3A%2F%2Ffeeds.simplecast.com%2FhEI_f9Dx`,
    )

    // the typical ways to die when calling an api
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // This is where we transform the data into the shape we expect for our MST model.
      const episodes: EpisodeSnapshotIn[] =
        rawData?.items.map((raw) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", episodes }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
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
  async createCookbook(cookbook: CookbookToAddSnapshotIn): Promise<{ kind: "ok"; cookbookId: number } | GeneralApiProblem> {
    const response: ApiResponse<number> = await this.authorizedRequest('Cookbooks', "POST", {
      title: cookbook.title,
      image: cookbook.image
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
   * Gets a list of invitations.
   */
  async GetInvitations(
    pageNumber: number,
    pageSize: number,
    status: string = "Sent"
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
   * Gets a list of recipes matching a cookbookId with pagination.
   */
  async getRecipes(
    cookbookId: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ kind: "ok"; recipes: RecipeListSnapshotIn } | GeneralApiProblem> {
    // prepare query parameters
    const params = { CookbookId: cookbookId, PageNumber: pageNumber, PageSize: pageSize }

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
   * Saves a new recipe to the database.
   */
  async createRecipe(recipe: RecipeToAddSnapshotIn)
  : Promise<{ kind: "ok"; recipeId: number} | GeneralApiProblem> {
    const response: ApiResponse<number> = await this.authorizedRequest('Recipes', "POST", {
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

  async createInvite(cookbookId: number, email: string)
    : Promise<{ kind: "ok"; invitationId: number } | GeneralApiProblem> {
    const response: ApiResponse<number> = await this.authorizedRequest('Invitations', "POST", {
      email,
      cookbookId,
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

  async updateInvite(id: number, accepted: boolean)
    : Promise<{ kind: "ok"; invitationId: number } | GeneralApiProblem> {
    var newStatus = accepted 
      ? CookbookInvitationStatus.Accepted
      : CookbookInvitationStatus.Rejected

      const response: ApiResponse<number> = await this.authorizedRequest('Invitations', "PUT", {
        id,
        newStatus
      })

      if (!response.ok){
        const problem = getGeneralApiProblem(response)
        if (problem) return problem
      }

      try {
        const invitationId = response.data!
        return { kind: "ok", invitationId }
      } catch (e){
        if (__DEV__ && e instanceof Error) {
          console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
        }
        return { kind: "bad-data" }
      }
  }

  /**
   * Uploads a collection of images to the server. TODO update method name to plural
   */
  async uploadImage(images: ImagePickerAsset[]): Promise<{ kind: "ok"; keys: string[] } | GeneralApiProblem> {
    const formData = new FormData();
    images.forEach(image => {
      const imageData = {
        uri: image.uri,
        name: image.fileName,
        type: image.mimeType,
      } as any
      formData.append("file", imageData);
    })
    const accessToken = await SecureStore.getItemAsync("accessToken")

    const response: ApiResponse<any> = await this.apisauce.post("Images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${accessToken}`
      },
    });

    // Handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response);
      if (problem) return problem;
    }

    // Process the response and return the uploaded file key
    try {
      const keys = response.data;
      return { kind: "ok", keys };
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack);
      }
      return { kind: "bad-data" };
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
      const authResult = AuthResultModel.create(response.data)
      return { kind: "ok", authResult }
    } catch (e) {
      if (__DEV__ && e instanceof Error) {
        console.error(`Bad data: ${e.message}\n${response.data}`, e.stack)
      }
      return { kind: "bad-data" }
    }
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
          // TODO Log out the user
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
}

// Singleton instance of the API for convenience
export const api = new Api()
