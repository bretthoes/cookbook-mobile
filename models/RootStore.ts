import { AuthenticationStoreModel } from "@/models/AuthenticationStore"
import { CookbookStoreModel } from "@/models/CookbookStore"
import { InvitationStoreModel } from "@/models/InvitationStore"
import { MembershipStoreModel } from "@/models/MembershipStore"
import { RecipeStoreModel } from "@/models/Recipe/RecipeStore"
import { SubscriptionStoreModel } from "@/models/SubscriptionStore"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  cookbookStore: types.optional(CookbookStoreModel, {}),
  recipeStore: types.optional(RecipeStoreModel, {}),
  membershipStore: types.optional(MembershipStoreModel, {}),
  invitationStore: types.optional(InvitationStoreModel, {}),
  subscriptionStore: types.optional(SubscriptionStoreModel, {}),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
