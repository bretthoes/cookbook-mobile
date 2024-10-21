import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Cookbook, CookbookModel, CookbookToAddSnapshotIn } from "./Cookbook"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { CookbookListModel } from "./CookbookList"

export const CookbookStoreModel = types
  .model("CookbookStore")
  .props({
    cookbooks: types.optional(CookbookListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
    currentCookbook: types.maybeNull(types.reference(CookbookModel)),
    favorites: types.array(types.reference(CookbookModel)),
    favoritesOnly: false,
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    async fetchCookbooks() {
      this.clearCurrentCookbook()
      const response = await api.getCookbooks()
      if (response.kind === "ok") {
        console.debug(JSON.stringify(response.cookbooks, null, 2))
        self.setProp("cookbooks", response.cookbooks)
      } else {
        console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
      }
    },
    createCookbook: flow(function* (cookbookToAdd: CookbookToAddSnapshotIn) {
      try {
        const response = yield api.createCookbook(cookbookToAdd)
        if (response.kind === "ok") {
          const existingCookbook = self.cookbooks.items.find(ep => ep.id === response.cookbookId)
          if (!existingCookbook) {
            const newCookbook = CookbookModel.create({
              id: response.cookbookId,
              title: cookbookToAdd.title,
              image: cookbookToAdd.image,
              membersCount: 1,
            })
            self.cookbooks.items.push(newCookbook)
            self.currentCookbook = newCookbook
          }
        }
      } catch (error){
        console.error(`Error creating cookbook: ${error}`)
      }
    }),
    setCurrentCookbook(cookbook: Cookbook) {
      self.currentCookbook = cookbook
    },
    clearCurrentCookbook() {
      self.currentCookbook = null
    },
    addFavorite(cookbook: Cookbook) {
      self.favorites.push(cookbook)
    },
    removeFavorite(cookbook: Cookbook) {
      self.favorites.remove(cookbook)
    },
  }))
  .views((store) => ({
    get cookbooksForList() {
      return store.favoritesOnly ? store.favorites : store.cookbooks?.items ?? []
    },

    hasFavorite(cookbook: Cookbook) {
      return store.favorites.includes(cookbook) ?? false
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
