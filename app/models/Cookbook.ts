import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Config from "app/config"

/**
 * This represents a cookbook.
 */
export const CookbookModel = types
  .model("Cookbook")
  .props({
    id: types.integer,
    title: "",
    imagePath: "",
    membersCount: types.integer
  })
  .actions(withSetPropAction)
  .views((cookbook) => ({
    get parsedTitleAndSubtitle() {
      const defaultValue = { title: cookbook.title?.trim() }

      if (!defaultValue.title) return defaultValue

      const titleMatches = defaultValue.title.match(/^(RNR.*\d)(?: - )(.*$)/)

      if (!titleMatches || titleMatches.length !== 3) return defaultValue

      return { title: titleMatches[1], subtitle: titleMatches[2] }
    },
    get getImagePath() {
      return cookbook.imagePath ? `${Config.S3_URL}/${cookbook.imagePath}` : cookbook.imagePath
    },
  }))

export interface Cookbook extends Instance<typeof CookbookModel> {}
export interface CookbookSnapshotOut extends SnapshotOut<typeof CookbookModel> {}
export interface CookbookSnapshotIn extends SnapshotIn<typeof CookbookModel> {}
