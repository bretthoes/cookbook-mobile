/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import type { components } from "@/services/api/generated/schema"
import type { AuthResult } from "@/types/auth"
import type {
  CookbookList,
  CookbookItem,
  CookbookToAdd,
} from "@/types/cookbook"
import type { InvitationList, Invitation } from "@/types/invitation"
import type { MembershipList, Membership } from "@/types/membership"
import type { RecipeList, RecipeDetail, RecipeToAdd } from "@/types/recipe"
import { GeneralApiProblem } from "@/services/api/apiProblem"
import { apiClientInstance } from "@/services/api/client"
import * as cookbookWrappers from "@/services/api/wrappers/cookbooks"
import * as imageWrappers from "@/services/api/wrappers/images"
import * as invitationWrappers from "@/services/api/wrappers/invitations"
import * as membershipWrappers from "@/services/api/wrappers/memberships"
import * as recipeWrappers from "@/services/api/wrappers/recipes"
import * as userWrappers from "@/services/api/wrappers/users"
import { ImagePickerAsset } from "expo-image-picker"

/**
 * Manages all requests to the API. You can use this class to build out
 * various requests that you need to call from your backend API.
 */
export class Api {
  /**
   * Sets a callback to be called when the session expires and logout is needed.
   * This avoids circular dependencies with the store.
   */
  setSessionExpiredCallback(callback: () => void) {
    apiClientInstance.setSessionExpiredCallback(callback)
  }

  setOnAccessTokenRefreshed(callback: (accessToken: string) => void) {
    apiClientInstance.setOnAccessTokenRefreshed(callback)
  }

  /**
   * Gets a list of cookbooks with pagination.
   */
  async getCookbooks(
    pageNumber = 1,
    pageSize = 10,
  ): Promise<{ kind: "ok"; cookbooks: CookbookList } | GeneralApiProblem> {
    return cookbookWrappers.getCookbooks(pageNumber, pageSize)
  }

  /**
   * Saves a new cookbook to the database.
   */
  async createCookbook(
    cookbook: CookbookToAdd,
  ): Promise<{ kind: "ok"; cookbookId: string } | GeneralApiProblem> {
    return cookbookWrappers.createCookbook(cookbook)
  }

  /**
   * Deletes a single cookbook by its id.
   */
  async deleteCookbook(cookbookId: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return cookbookWrappers.deleteCookbook(cookbookId)
  }

  /**
   * Gets a list of memberships matching a cookbookId with pagination.
   */
  async getMemberships(
    cookbookId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ kind: "ok"; memberships: MembershipList } | GeneralApiProblem> {
    return membershipWrappers.getMemberships(cookbookId, pageNumber, pageSize)
  }

  /**
   * Gets the membership by cookbookId.
   */
  async getMembership(
    cookbookId: string,
  ): Promise<{ kind: "ok"; membership: Membership } | GeneralApiProblem> {
    return membershipWrappers.getMembership(cookbookId)
  }

  /**
   * Gets a single invitation token by its token.
   */
  async getInvitationToken(
    token: string,
  ): Promise<{ kind: "ok"; invitation: Invitation } | GeneralApiProblem> {
    return invitationWrappers.getInvitationToken(token)
  }

  /**
   * Gets a list of invitations.
   */
  async getInvitations(
    pageNumber: number,
    pageSize: number,
    status: string = "Active",
  ): Promise<{ kind: "ok"; invitations: InvitationList } | GeneralApiProblem> {
    return invitationWrappers.getInvitations(pageNumber, pageSize, status)
  }

  /**
   * Gets a count of invitations.
   */
  async getInvitationCount(): Promise<{ kind: "ok"; count: number } | GeneralApiProblem> {
    return invitationWrappers.getInvitationCount()
  }

  /**
   * Gets a list of recipes matching a cookbookId with pagination.
   */
  async getRecipes(
    cookbookId: string,
    search: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ kind: "ok"; recipes: RecipeList } | GeneralApiProblem> {
    return recipeWrappers.getRecipes(cookbookId, search, pageNumber, pageSize)
  }

  /**
   * Gets a single recipe by its id.
   */
  async getRecipe(
    recipeId: string,
  ): Promise<{ kind: "ok"; recipe: RecipeDetail } | GeneralApiProblem> {
    return recipeWrappers.getRecipe(recipeId)
  }

  /**
   * Deletes a single recipe by its id.
   */
  async deleteRecipe(recipeId: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return recipeWrappers.deleteRecipe(recipeId)
  }

  /**
   * Saves a new recipe to the database.
   */
  async createRecipe(
    recipe: RecipeToAdd,
  ): Promise<{ kind: "ok"; recipeId: string } | GeneralApiProblem> {
    return recipeWrappers.createRecipe(recipe)
  }

  async updateRecipe(
    recipe: RecipeDetail,
  ): Promise<{ kind: "ok"; recipeId: string } | GeneralApiProblem> {
    return recipeWrappers.updateRecipe(recipe)
  }

  async createInvite(
    cookbookId: string,
    email: string,
  ): Promise<{ kind: "ok"; token: string } | GeneralApiProblem> {
    return invitationWrappers.createInvite(cookbookId, email)
  }

  async createInviteToken(
    cookbookId: string,
  ): Promise<{ kind: "ok"; token: string } | GeneralApiProblem> {
    return invitationWrappers.createInviteToken(cookbookId)
  }

  async updateInvite(
    id: string,
    accepted: boolean,
  ): Promise<{ kind: "ok"; invitationId: string } | GeneralApiProblem> {
    return invitationWrappers.updateInvite(id, accepted)
  }

  /**
   * Updates an invitation token by its token string.
   */
  async updateInvitationToken(
    token: string,
    accepted: boolean,
  ): Promise<{ kind: "ok"; invitationId: string } | GeneralApiProblem> {
    return invitationWrappers.updateInvitationToken(token, accepted)
  }

  /**
   * Uploads a collection of images to the server. TODO update method name to plural
   */
  async uploadImage(
    images: ImagePickerAsset[],
  ): Promise<{ kind: "ok"; keys: string[] } | GeneralApiProblem> {
    return imageWrappers.uploadImage(images)
  }

  async extractRecipeFromUrl(
    url: string,
  ): Promise<{ kind: "ok"; recipe: RecipeToAdd } | GeneralApiProblem> {
    return recipeWrappers.extractRecipeFromUrl(url)
  }

  async extractRecipeFromVoice(
    transcript: string,
  ): Promise<{ kind: "ok"; recipe: RecipeToAdd } | GeneralApiProblem> {
    return recipeWrappers.extractRecipeFromVoice(transcript)
  }

  async extractRecipeFromSocialUrl(
    url: string,
  ): Promise<{ kind: "ok"; recipe: RecipeToAdd } | GeneralApiProblem> {
    return recipeWrappers.extractRecipeFromSocialUrl(url)
  }

  async extractRecipeFromImage(
    image: ImagePickerAsset,
  ): Promise<{ kind: "ok"; recipe: RecipeToAdd } | GeneralApiProblem> {
    return recipeWrappers.extractRecipeFromImage(image)
  }

  async applyRecipeEditFromPrompt(
    prompt: string,
    recipe: components["schemas"]["RecipeDto"],
  ): Promise<{ kind: "ok"; recipe: components["schemas"]["RecipeDto"] } | GeneralApiProblem> {
    return recipeWrappers.applyRecipeEditFromPrompt(prompt, recipe)
  }

  /**
   * Gets the current user's email.
   */
  async getEmail(): Promise<{ kind: "ok"; email: string } | GeneralApiProblem> {
    return userWrappers.getEmail()
  }

  /**
   * Updates the current user.
   */
  async updateUser(displayName: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return userWrappers.updateUser(displayName)
  }

  /**
   * Gets the current user's display name.
   */
  async getDisplayName(): Promise<{ kind: "ok"; displayName: string } | GeneralApiProblem> {
    return userWrappers.getDisplayName()
  }

  /**
   * Permanently deletes the signed-in account.
   */
  async deleteAccount(): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return userWrappers.deleteAccount()
  }

  /**
   * Logs in the user with the provided email and password.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ kind: "ok"; authResult: AuthResult } | GeneralApiProblem> {
    return userWrappers.login(email, password)
  }

  async loginWithProvider(
    provider: userWrappers.ExternalLoginProvider,
    token: string,
  ): Promise<{ kind: "ok"; authResult: AuthResult } | GeneralApiProblem> {
    return userWrappers.loginWithProvider(provider, token)
  }

  async register(email: string, password: string): Promise<userWrappers.RegisterResult> {
    return userWrappers.register(email, password)
  }

  async resendConfirmationEmail(email: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return userWrappers.resendConfirmationEmail(email)
  }

  async forgotPassword(email: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return userWrappers.forgotPassword(email)
  }

  async resetPassword(
    email: string,
    resetCode: string,
    newPassword: string,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return userWrappers.resetPassword(email, resetCode, newPassword)
  }

  /**
   * Updates a membership's permissions.
   */
  async updateMembership(
    membershipId: string,
    tier: import("@/types/membership").MembershipTier,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return membershipWrappers.updateMembership(membershipId, tier)
  }

  /**
   * Deletes a membership.
   */
  async deleteMembership(membershipId: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return membershipWrappers.deleteMembership(membershipId)
  }

  async updateCookbook(cookbook: CookbookItem): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return cookbookWrappers.updateCookbook(cookbook)
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
