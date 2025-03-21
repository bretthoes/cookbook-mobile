import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { EpisodeStoreModel } from "./EpisodeStore"
import { CookbookStoreModel } from "./CookbookStore"
import { RecipeStoreModel } from "./Recipe/RecipeStore"
import { MembershipStoreModel } from "./MembershipStore"
import { InvitationStoreModel } from "./InvitationStore"
/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  episodeStore: types.optional(EpisodeStoreModel, {}),
  cookbookStore: types.optional(CookbookStoreModel, {}),
  recipeStore: types.optional(RecipeStoreModel, {}),
  membershipStore: types.optional(MembershipStoreModel, {}),
  invitationStore: types.optional(InvitationStoreModel, {}),
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
