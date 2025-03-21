import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"

/**
 * This represents a brief recipe with fewer properties than a recipe model.
 */
export const RecipeBriefModel = types
  .model("RecipeBrief")
  .props({
    id: types.identifierNumber,
    title: types.string,
    image: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)

export interface RecipeBrief extends Instance<typeof RecipeBriefModel> {}
export interface RecipeBriefSnapshotOut extends SnapshotOut<typeof RecipeBriefModel> {}
export interface RecipeBriefSnapshotIn extends SnapshotIn<typeof RecipeBriefModel> {}
