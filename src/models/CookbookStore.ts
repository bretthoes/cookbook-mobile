import { destroy, flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Cookbook, CookbookModel, CookbookSnapshotIn, CookbookToAddModel, CookbookToAddSnapshotIn } from "./Cookbook"
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
    create: flow(function* () {
      try {
        if (!self.cookbookToAdd) return
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
          return true
        } else {
          console.error(`Error creating cookbook: ${JSON.stringify(response)}`)
          return false
        }
      } catch (error) {
        console.error(`Error creating cookbook: ${error}`)
        return false
      }
    }),
    fetch: flow(function* (pageNumber = 1, pageSize = 100) {
      const response = yield api.getCookbooks(pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("cookbooks", response.cookbooks.items)
      } else {
        console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
      }
    }),
    update: flow(function* (cookbook: CookbookSnapshotIn) {
      try {
        const response = yield api.updateCookbook(cookbook)
        if (response.kind === "ok") {
          if (self.currentCookbook) self.currentCookbook.update(cookbook)
          return true
        }
        return false
      } catch (e) {
        console.error(`Error updating cookbook: ${e}`)
        return false
      }
    }),
    remove() {
      destroy(self.currentCookbook)
      self.setProp("currentCookbook", null)
    },
    setCurrentCookbookById(id: number) {
      const cookbook = this.getById(id)
      if (cookbook) self.currentCookbook = cookbook
    },
    getById(id: number) {
      return self.cookbooks.find((cookbook) => cookbook.id === id)
    },
    setCookbookToAdd(cookbook: CookbookToAddSnapshotIn) {
      self.cookbookToAdd = CookbookToAddModel.create(cookbook)
    },
    addFavorite(cookbook: Cookbook) {
      self.favorites.push(cookbook)
    },
    removeFavorite(cookbook: Cookbook) {
      self.favorites.remove(cookbook)
    }
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
