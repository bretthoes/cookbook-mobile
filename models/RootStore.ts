import { AuthenticationStoreModel } from "@/models/AuthenticationStore"
import { CookbookStoreModel } from "@/models/CookbookStore"
import { EpisodeStoreModel } from "@/models/EpisodeStore"
import { InvitationStoreModel } from "@/models/InvitationStore"
import { MembershipStoreModel } from "@/models/MembershipStore"
import { RecipeStoreModel } from "@/models/Recipe/RecipeStore"
import { Instance, SnapshotOut, types } from "mobx-state-tree"
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
