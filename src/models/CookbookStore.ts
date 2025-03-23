import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Cookbook, CookbookModel, CookbookToAddModel, CookbookToAddSnapshotIn } from "./Cookbook"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const CookbookStoreModel = types
  .model("CookbookStore")
  .props({
    cookbooks: types.array(CookbookModel),
    favorites: types.array(types.reference(CookbookModel)),
    currentCookbook: types.maybeNull(types.reference(CookbookModel)),
    cookbookToAdd: types.maybeNull(CookbookToAddModel),
    favoritesOnly: false,
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    setCookbookToAdd(cookbook: CookbookToAddSnapshotIn) {
      self.cookbookToAdd = CookbookToAddModel.create(cookbook)
    },
    async fetch(pageNumber = 1, pageSize = 100) {
      const response = await api.getCookbooks(pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("cookbooks", response.cookbooks.items)
      } else {
        console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
      }
    },
    setCurrentCookbook(cookbook: Cookbook) {
      self.currentCookbook = cookbook
    },
    create: flow(function* () {
      try {
        if (!self.cookbookToAdd) return
        self.currentCookbook = null
        const response = yield api.createCookbook(self.cookbookToAdd)
        if (response.kind === "ok") {
          const newCookbook = CookbookModel.create({
            id: response.cookbookId,
            title: self.cookbookToAdd.title,
            image: self.cookbookToAdd.image,
            author: response.author,
            authorEmail: response.authorEmail,
            membersCount: 1,
            recipeCount: 0,
          })
          self.cookbooks.push(newCookbook)
          self.currentCookbook = newCookbook
          return response
        } else {
          console.error(`Error creating cookbook: ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error(`Error creating cookbook: ${error}`)
      }
    }),
    addFavorite(cookbook: Cookbook) {
      self.favorites.push(cookbook)
    },
    removeFavorite(cookbook: Cookbook) {
      self.favorites.remove(cookbook)
    },
    async deleteCookbook(cookbookId: number) {
      const response = await api.deleteCookbook(cookbookId)
      if (response.kind === "ok") {
        self.setProp("cookbooks", self.cookbooks.filter(cookbook => cookbook.id !== cookbookId))
        if (self.currentCookbook?.id === cookbookId) {
          self.currentCookbook = null
        }
      } else {
        console.error(`Error deleting cookbook: ${JSON.stringify(response)}`)
      }
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
  }))

export interface CookbookStore extends Instance<typeof CookbookStoreModel> {}
export interface CookbookStoreSnapshot extends SnapshotOut<typeof CookbookStoreModel> {}
