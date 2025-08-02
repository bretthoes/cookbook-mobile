import { getRoot, Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "./helpers/withSetPropAction"
import Config from "src/config"
import { translate } from "src/i18n"
import { RootStore } from "./RootStore"

/**
 * This represents a cookbook.
 */
export const CookbookModel = types
  .model("Cookbook")
  .props({
    id: types.identifierNumber,
    title: types.string,
    image: types.maybeNull(types.string),
    author: types.maybeNull(types.string),
    authorEmail: types.maybeNull(types.string),
    membersCount: types.integer,
    recipeCount: types.integer,
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    update(updatedCookbook: CookbookSnapshotIn) {
      self.setProp("title", updatedCookbook.title)
      self.setProp("image", updatedCookbook.image)
    },
    remove() {
      const rootStore = getRoot(self) as RootStore
      rootStore.cookbookStore.remove()
    },
  }))
  .views((cookbook) => ({
    get parsedTitleAndSubtitle() {
      const defaultValue = { title: cookbook.title?.trim() }

      if (!defaultValue.title) return defaultValue

      const titleMatches = defaultValue.title.match(/^(RNR.*\d)(?: - )(.*$)/)

      if (!titleMatches || titleMatches.length !== 3) return defaultValue

      return { title: titleMatches[1], subtitle: titleMatches[2] }
    },
    get members() {
      return {
        textLabel: translate("demoPodcastListScreen:cookbookListScreen.cookbookCard.membersLabel", { count: cookbook.membersCount }),
        accessibilityLabel: translate("demoPodcastListScreen:accessibility.durationLabel", {}),
      }
    },
    get recipes() {
      return {
        textLabel: translate("demoPodcastListScreen:cookbookListScreen.cookbookCard.recipesLabel", { count: cookbook.recipeCount }),
        accessibilityLabel: translate("demoPodcastListScreen:accessibility.durationLabel", {}),
      }
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
