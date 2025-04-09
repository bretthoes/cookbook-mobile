import { destroy, flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Cookbook, CookbookModel, CookbookSnapshotIn, CookbookToAddModel, CookbookToAddSnapshotIn } from "./Cookbook"
import { withSetPropAction } from "./helpers/withSetPropAction"

export const CookbookStoreModel = types
  .model("CookbookStore")
  .props({
    cookbooks: types.array(CookbookModel),
    favorites: types.array(types.reference(CookbookModel)),
    selected: types.maybeNull(types.reference(CookbookModel)),
    favoritesOnly: false,
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    create: flow(function* (cookbookToAdd: CookbookToAddSnapshotIn) {
      const response = yield api.createCookbook(cookbookToAdd)
      if (response.kind === "ok") {
        const newCookbook = CookbookModel.create({
          id: response.cookbookId,
          title: cookbookToAdd.title,
          image: cookbookToAdd.image,
          author: response.author,
          authorEmail: response.authorEmail,
          membersCount: 1,
          recipeCount: 0,
        })
        self.cookbooks.push(newCookbook)
        self.selected = newCookbook
        return true
      }
      console.error(`Error creating cookbook: ${JSON.stringify(response)}`)
      return false
    }),
    fetch: flow(function* (pageNumber = 1, pageSize = 100) {
      const response = yield api.getCookbooks(pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("cookbooks", response.cookbooks.items)
        return true
      }
      else console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
      return false
    }),
    update: flow(function* (cookbook: CookbookSnapshotIn) {
      const response = yield api.updateCookbook(cookbook)
      if (response.kind === "ok") {
        if (self.selected) self.selected.update(cookbook)
        return true
      }
      else console.error(`Error updating cookbook: ${JSON.stringify(response)}`)
      return false
    }),
    remove() {
      destroy(self.selected)
      self.setProp("selected", null)
    },
    setSelectedById(id: number) {
      const cookbook = this.getById(id)
      if (cookbook) self.selected = cookbook
    },
    getById(id: number) {
      return self.cookbooks.find((cookbook) => cookbook.id === id)
    },    addFavorite(cookbook: Cookbook) {
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
