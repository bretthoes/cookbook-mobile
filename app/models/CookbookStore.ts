import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Cookbook, CookbookModel, CookbookToAddSnapshotIn } from "./Cookbook"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const CookbookStoreModel = types
  .model("CookbookStore")
  .props({
    cookbooks: types.array(CookbookModel),
    favorites: types.array(types.reference(CookbookModel)),
    favoritesOnly: false,
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async fetchCookbooks() {
      const response = await api.getCookbooks()
      if (response.kind === "ok") {
        store.setProp("cookbooks", response.cookbooks)
      } else {
        console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
      }
    },
    async createCookbook(cookbookToAdd: CookbookToAddSnapshotIn) {
      try {
        const response = await api.createCookbook(cookbookToAdd)
        if (response.kind === "ok") {
          const addedCookbook = CookbookModel.create({
            id: response.cookbookId,
            title: cookbookToAdd.title,
            image: cookbookToAdd.image,
            membersCount: 1,
          })
          store.setProp("cookbooks", [
            ...store.cookbooks,
            addedCookbook
          ])
          // TODO update current cookbook with the one we just added
        } else {
          console.error(`Error creating cookbook: ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error(`Error creating cookbook: ${error}`)
      }
    },
    addFavorite(cookbook: Cookbook) {
      store.favorites.push(cookbook)
    },
    removeFavorite(cookbook: Cookbook) {
      store.favorites.remove(cookbook)
    },
  }))
  .views((store) => ({
    get cookbooksForList() {
      return store.favoritesOnly ? store.favorites : store.cookbooks
    },

    hasFavorite(cookbook: Cookbook) {
      return store.favorites.includes(cookbook)
    },
  }))
  .actions((store) => ({
    toggleFavorite(cookbook: Cookbook) {
      if (store.hasFavorite(cookbook)) {
        store.removeFavorite(cookbook)
      } else {
        store.addFavorite(cookbook)
      }
    },
  })
)

export interface CookbookStore extends Instance<typeof CookbookStoreModel> {}
export interface CookbookStoreSnapshot extends SnapshotOut<typeof CookbookStoreModel> {}
