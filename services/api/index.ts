/**
 * This Api class lets you define an API endpoint and methods to request
 * data and process it.
 *
 * See the [Backend API Integration](https://docs.infinite.red/ignite-cli/boilerplate/app/services/#backend-api-integration)
 * documentation for more details.
 */
import { AuthResultSnapshotIn } from "@/models/AuthResult"
import { CookbookSnapshotIn, CookbookToAddSnapshotIn } from "@/models/Cookbook"
import {
  CookbookListSnapshotIn,
  InvitationListSnapshotIn,
  MembershipListSnapshotIn,
  RecipeListSnapshotIn,
} from "@/models/generics"
import { InvitationSnapshotOut } from "@/models/Invitation"
import { MembershipSnapshotOut } from "@/models/Membership"
import { RecipeSnapshotIn, RecipeSnapshotOut, RecipeToAddSnapshotIn } from "@/models/Recipe"
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

  /**
   * Gets a list of cookbooks with pagination.
   */
  async getCookbooks(
    pageNumber = 1,
    pageSize = 10,
  ): Promise<{ kind: "ok"; cookbooks: CookbookListSnapshotIn } | GeneralApiProblem> {
    return cookbookWrappers.getCookbooks(pageNumber, pageSize)
  }

  /**
   * Saves a new cookbook to the database.
   */
  async createCookbook(
    cookbook: CookbookToAddSnapshotIn,
  ): Promise<{ kind: "ok"; cookbookId: number } | GeneralApiProblem> {
    return cookbookWrappers.createCookbook(cookbook)
  }

  /**
   * Deletes a single cookbook by its id.
   */
  async deleteCookbook(cookbookId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return cookbookWrappers.deleteCookbook(cookbookId)
  }

  /**
   * Gets a list of memberships matching a cookbookId with pagination.
   */
  async GetMemberships(
    cookbookId: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<{ kind: "ok"; memberships: MembershipListSnapshotIn } | GeneralApiProblem> {
    return membershipWrappers.GetMemberships(cookbookId, pageNumber, pageSize)
  }

  /**
   * Gets the membership by cookbookId.
   */
  async getMembership(
    cookbookId: number,
  ): Promise<{ kind: "ok"; membership: MembershipSnapshotOut } | GeneralApiProblem> {
    return membershipWrappers.getMembership(cookbookId)
  }

  /**
   * Gets a single invitation token by its token.
   */
  async GetInvitationToken(
    token: string,
  ): Promise<{ kind: "ok"; invitation: InvitationSnapshotOut } | GeneralApiProblem> {
    return invitationWrappers.GetInvitationToken(token)
  }

  /**
   * Gets a list of invitations.
   */
  async GetInvitations(
    pageNumber: number,
    pageSize: number,
    status: string = "Active",
  ): Promise<{ kind: "ok"; invitations: InvitationListSnapshotIn } | GeneralApiProblem> {
    return invitationWrappers.GetInvitations(pageNumber, pageSize, status)
  }

  /**
   * Gets a count of invitations.
   */
  async GetInvitationCount(): Promise<{ kind: "ok"; count: number } | GeneralApiProblem> {
    return invitationWrappers.GetInvitationCount()
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
    return recipeWrappers.getRecipes(cookbookId, search, pageNumber, pageSize)
  }

  /**
   * Gets a single recipe by its id.
   */
  async getRecipe(
    recipeId: number,
  ): Promise<{ kind: "ok"; recipe: RecipeSnapshotOut } | GeneralApiProblem> {
    return recipeWrappers.getRecipe(recipeId)
  }

  /**
   * Deletes a single recipe by its id.
   */
  async deleteRecipe(recipeId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return recipeWrappers.deleteRecipe(recipeId)
  }

  /**
   * Saves a new recipe to the database.
   */
  async createRecipe(
    recipe: RecipeToAddSnapshotIn,
  ): Promise<{ kind: "ok"; recipeId: number } | GeneralApiProblem> {
    return recipeWrappers.createRecipe(recipe)
  }

  async updateRecipe(
    recipe: RecipeSnapshotIn,
  ): Promise<{ kind: "ok"; recipeId: number } | GeneralApiProblem> {
    return recipeWrappers.updateRecipe(recipe)
  }

  async createInvite(
    cookbookId: number,
    email: string,
  ): Promise<{ kind: "ok"; token: string } | GeneralApiProblem> {
    return invitationWrappers.createInvite(cookbookId, email)
  }

  async createInviteToken(
    cookbookId: number,
  ): Promise<{ kind: "ok"; token: string } | GeneralApiProblem> {
    return invitationWrappers.createInviteToken(cookbookId)
  }

  async updateInvite(
    id: number,
    accepted: boolean,
  ): Promise<{ kind: "ok"; invitationId: number } | GeneralApiProblem> {
    return invitationWrappers.updateInvite(id, accepted)
  }

  /**
   * Updates an invitation token by its token string.
   */
  async UpdateInvitationToken(
    token: string,
    accepted: boolean,
  ): Promise<{ kind: "ok"; invitationId: number } | GeneralApiProblem> {
    return invitationWrappers.UpdateInvitationToken(token, accepted)
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
  ): Promise<{ kind: "ok"; recipe: RecipeToAddSnapshotIn } | GeneralApiProblem> {
    return recipeWrappers.extractRecipeFromUrl(url)
  }

  async extractRecipeFromImage(
    image: ImagePickerAsset,
  ): Promise<{ kind: "ok"; recipe: RecipeToAddSnapshotIn } | GeneralApiProblem> {
    return recipeWrappers.extractRecipeFromImage(image)
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
   * Logs in the user with the provided email and password.
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ kind: "ok"; authResult: AuthResultSnapshotIn } | GeneralApiProblem> {
    return userWrappers.login(email, password)
  }

  async loginWithGoogle(
    idToken: string,
  ): Promise<{ kind: "ok"; authResult: AuthResultSnapshotIn } | GeneralApiProblem> {
    return userWrappers.loginWithGoogle(idToken)
  }

  async register(email: string, password: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
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
    membershipId: number,
    membership: MembershipSnapshotOut,
  ): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return membershipWrappers.updateMembership(membershipId, membership)
  }

  /**
   * Deletes a membership.
   */
  async deleteMembership(membershipId: number): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return membershipWrappers.deleteMembership(membershipId)
  }

  async updateCookbook(cookbook: CookbookSnapshotIn): Promise<{ kind: "ok" } | GeneralApiProblem> {
    return cookbookWrappers.updateCookbook(cookbook)
  }
}

// Singleton instance of the API for convenience
export const api = new Api()
