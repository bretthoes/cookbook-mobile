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
import type { ApiConfig, ApiCookbooksResponse, ApiFeedResponse, ApiRecipesResponse } from "./api.types"
import type { EpisodeSnapshotIn } from "../../models/Episode"
import { AuthResultModel, AuthResultSnapshotIn } from "../../models/AuthResult"
import * as SecureStore from 'expo-secure-store';
import { CookbookSnapshotIn } from "app/models/Cookbook"
import { RecipeBriefSnapshotIn, RecipeSnapshotIn } from "app/models/Recipe"

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
    const accessToken = await SecureStore.getItemAsync("accessToken");
    if (accessToken) {
      apisauce.setHeader("Authorization", `Bearer ${accessToken}`);
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
  async getCookbooks(pageNumber = 1, pageSize = 10): Promise<{ kind: "ok"; cookbooks: CookbookSnapshotIn[] } | GeneralApiProblem> {
    // prepare query parameters
    const params = { PageNumber: pageNumber, PageSize: pageSize }

    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<ApiCookbooksResponse> = await this.authorizedRequest("Cookbooks", "GET", params)

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // this is where we transform the data into the shape we expect for our MST model.
      const cookbooks: CookbookSnapshotIn[] =
        rawData?.items.map((raw: CookbookSnapshotIn) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", cookbooks }
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
  async getRecipes(cookbookId: number, pageNumber = 1, pageSize = 99): Promise<{ kind: "ok"; recipes: RecipeBriefSnapshotIn[] } | GeneralApiProblem> {
    // prepare query parameters
    const params = { CookbookId: cookbookId, PageNumber: pageNumber, PageSize: pageSize }

    // use the authorizedRequest method to make the API call with query parameters
    const response: ApiResponse<ApiRecipesResponse> = await this.authorizedRequest("Recipes", "GET", params)

    // handle any errors
    if (!response.ok) {
      const problem = getGeneralApiProblem(response)
      if (problem) return problem
    }

    // transform the data into the format we are expecting
    try {
      const rawData = response.data

      // this is where we transform the data into the shape we expect for our MST model.
      const recipes: RecipeBriefSnapshotIn[] =
        rawData?.items.map((raw: RecipeBriefSnapshotIn) => ({
          ...raw,
        })) ?? []

      return { kind: "ok", recipes }
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
  async getRecipe(recipeId: number): Promise<{ kind: "ok"; recipe: RecipeSnapshotIn } | GeneralApiProblem> {
    // make the API call to get the recipe by id
    const response: ApiResponse<RecipeSnapshotIn> = await this.authorizedRequest(`Recipes/${recipeId}`, "GET")

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

      if (response.status === 401) {
        const newAccessToken = await this.refreshAuthToken()
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
