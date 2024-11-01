import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { AuthenticationStoreModel } from "./AuthenticationStore"
import { EpisodeStoreModel } from "./EpisodeStore"
import { CookbookStoreModel } from "./CookbookStore"
import { RecipeStoreModel } from "./RecipeStore"
import { InvitationStoreModel } from "./InvitationStore"
import { MembershipStoreModel } from "./MembershipStore"

/**
 * A RootStore model.
 */
export const RootStoreModel = types.model("RootStore").props({
  authenticationStore: types.optional(AuthenticationStoreModel, {}),
  episodeStore: types.optional(EpisodeStoreModel, {}),
  cookbookStore: types.optional(CookbookStoreModel, {}),
  recipeStore: types.optional(RecipeStoreModel, {}),
  invitationStore: types.optional(InvitationStoreModel, {}),
  membershipStore: types.optional(MembershipStoreModel, {})
})

/**
 * The RootStore instance.
 */
export interface RootStore extends Instance<typeof RootStoreModel> {}
/**
 * The data of a RootStore.
 */
export interface RootStoreSnapshot extends SnapshotOut<typeof RootStoreModel> {}
