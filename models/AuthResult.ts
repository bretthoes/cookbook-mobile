import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"

/**
 * This represents the result of an authentication request.
 */
export const AuthResultModel = types
  .model("AuthResult")
  .props({
    tokenType: types.string,
    accessToken: types.string,
    expiresIn: types.number,
    refreshToken: types.string,
  })
  .actions(withSetPropAction)

export interface AuthResult extends Instance<typeof AuthResultModel> {}
export interface AuthResultSnapshotOut extends SnapshotOut<typeof AuthResultModel> {}
export interface AuthResultSnapshotIn extends SnapshotIn<typeof AuthResultModel> {}
