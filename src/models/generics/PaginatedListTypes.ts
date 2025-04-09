import { Instance, SnapshotIn, SnapshotOut } from "mobx-state-tree"
import { PaginatedListModel } from "./PaginatedList"
import { CookbookModel } from "../Cookbook"
import { RecipeModel } from "../Recipe/Recipe"
import { InvitationModel } from "../Invitation"
import { MembershipModel } from "../Membership"

// Instantiate PaginatedListModel with specific item models
export const CookbookListModel = PaginatedListModel(CookbookModel)
export const RecipeListModel = PaginatedListModel(RecipeModel)
export const InvitationListModel = PaginatedListModel(InvitationModel)
export const MembershipListModel = PaginatedListModel(MembershipModel)

// Type interfaces
export interface CookbookList extends Instance<typeof CookbookListModel> {}
export interface CookbookListSnapshotOut extends SnapshotOut<typeof CookbookListModel> {}
export interface CookbookListSnapshotIn extends SnapshotIn<typeof CookbookListModel> {}

export interface RecipeList extends Instance<typeof RecipeListModel> {}
export interface RecipeListSnapshotOut extends SnapshotOut<typeof RecipeListModel> {}
export interface RecipeListSnapshotIn extends SnapshotIn<typeof RecipeListModel> {}

export interface InvitationList extends Instance<typeof InvitationListModel> {}
export interface InvitationListSnapshotOut extends SnapshotOut<typeof InvitationListModel> {}
export interface InvitationListSnapshotIn extends SnapshotIn<typeof InvitationListModel> {}

export interface MembershipList extends Instance<typeof MembershipListModel> {}
export interface MembershipListSnapshotOut extends SnapshotOut<typeof MembershipListModel> {}
export interface MembershipListSnapshotIn extends SnapshotIn<typeof MembershipListModel> {}
