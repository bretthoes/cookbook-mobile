import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Config from "app/config"

/**
 * This represents a cookbook.
 */
export const CookbookModel = types
  .model("Cookbook")
  .props({
    id: types.identifierNumber,
    title: types.string,
    image: types.maybeNull(types.string),
    membersCount: types.integer,
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
    get getImage() {
      return cookbook.image ? `${Config.S3_URL}/${cookbook.image}` : ""
    },
  }))

export interface Cookbook extends Instance<typeof CookbookModel> {}
export interface CookbookSnapshotOut extends SnapshotOut<typeof CookbookModel> {}
export interface CookbookSnapshotIn extends SnapshotIn<typeof CookbookModel> {}


/**
 * This represents a cookbook to be added.
 */
export const CookbookToAddModel = types
  .model("RecipeToAdd")
  .props({
    title: types.string,
    image: types.maybeNull(types.string),
  })
  .actions(withSetPropAction)

export interface CookbookToAdd extends Instance<typeof CookbookToAddModel> {}
export interface CookbookToAddSnapshotOut extends SnapshotOut<typeof CookbookToAddModel> {}
export interface CookbookToAddSnapshotIn extends SnapshotIn<typeof CookbookToAddModel> {}