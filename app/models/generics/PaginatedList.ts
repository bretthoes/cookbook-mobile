import { IAnyModelType, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { CookbookModel } from "../Cookbook"
import { InvitationModel } from "../Invitation"
import { MembershipModel } from "../Membership"
import { RecipeBriefModel } from "../Recipe"

/**
 * A generic model representing a paginated list.
 */
export const PaginatedListModel = <T extends IAnyModelType>(itemModel: T) =>
  types
    .model("PaginatedList")
    .props({
      items: types.array(itemModel),
      pageNumber: types.integer,
      totalPages: types.integer,
      totalCount: types.integer,
    })
    .actions(withSetPropAction)
    .views((self) => ({
      get hasMultiplePages() {
        return self.totalPages > 1
      },
      get hasNextPage() {
        return self.pageNumber < self.totalPages
      },
      get hasPreviousPage() {
        return self.pageNumber > 1
      },
    }))

// Instantiate PaginatedListModel with specific item models
export const CookbookListModel = PaginatedListModel(CookbookModel)
export const RecipeListModel = PaginatedListModel(RecipeBriefModel)
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

