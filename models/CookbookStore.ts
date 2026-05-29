import { destroy, flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import * as ImagePicker from "expo-image-picker"
import { api } from "../services/api"
import { Cookbook, CookbookModel, CookbookSnapshotIn, CookbookToAddSnapshotIn } from "./Cookbook"
import { CookbookListModel } from "./generics/PaginatedListTypes"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { FetchState } from "./shared/fetchState"

export const COOKBOOK_LIST_PAGE_SIZE = 25

type CookbookListItems = {
  map<T>(fn: (item: Cookbook) => T): T[]
  replace(items: Cookbook[]): void
  push(item: Cookbook): void
}

type CookbookStoreSelf = {
  cookbookList: {
    items: CookbookListItems
    pageNumber: number
    totalPages: number
    totalCount: number
    setProp(key: "pageNumber" | "totalPages" | "totalCount", value: number): void
  }
  listFetchState: FetchState
  listLoadMoreState: FetchState
}

function applyCookbooksFirstPage(
  self: CookbookStoreSelf,
  items: CookbookSnapshotIn[],
  pageNumber: number,
  totalPages: number,
  totalCount: number,
) {
  const existingById = new Map(self.cookbookList.items.map((cookbook) => [cookbook.id, cookbook]))
  const nextItems: Cookbook[] = []

  for (const item of items) {
    const existing = existingById.get(item.id)
    if (existing) {
      existing.setProp("title", item.title)
      existing.setProp("image", item.image)
      existing.setProp("author", item.author)
      existing.setProp("authorEmail", item.authorEmail)
      existing.setProp("membersCount", item.membersCount)
      existing.setProp("recipeCount", item.recipeCount)
      nextItems.push(existing)
    } else {
      nextItems.push(CookbookModel.create(item))
    }
  }

  self.cookbookList.items.replace(nextItems)
  self.cookbookList.setProp("pageNumber", pageNumber)
  self.cookbookList.setProp("totalPages", totalPages)
  self.cookbookList.setProp("totalCount", totalCount)
}

function appendCookbooksPage(self: CookbookStoreSelf, items: CookbookSnapshotIn[]) {
  const existingIds = new Set(self.cookbookList.items.map((cookbook) => cookbook.id))
  for (const item of items) {
    if (existingIds.has(item.id)) continue
    self.cookbookList.items.push(CookbookModel.create(item))
  }
}

export const CookbookStoreModel = types
  .model("CookbookStore")
  .props({
    cookbookList: types.optional(CookbookListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
    listFetchState: types.optional(
      types.enumeration<FetchState>([FetchState.idle, FetchState.loading, FetchState.ready]),
      FetchState.idle,
    ),
    listLoadMoreState: types.optional(
      types.enumeration<FetchState>([FetchState.idle, FetchState.loading, FetchState.ready]),
      FetchState.idle,
    ),
    favorites: types.array(types.reference(CookbookModel)),
    selected: types.maybeNull(types.safeReference(CookbookModel)),
    favoritesOnly: false,
  })
  .preProcessSnapshot((snapshot: any) => {
    if (!snapshot || typeof snapshot !== "object") return snapshot
    if (Array.isArray(snapshot.cookbooks) && !snapshot.cookbookList) {
      const { cookbooks, ...rest } = snapshot
      return {
        ...rest,
        cookbookList: {
          items: cookbooks,
          pageNumber: 1,
          totalPages: 1,
          totalCount: cookbooks.length,
        },
      }
    }
    return snapshot
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
        self.cookbookList.items.push(newCookbook)
        self.cookbookList.setProp("totalCount", self.cookbookList.totalCount + 1)
        self.selected = newCookbook
        return true
      }
      console.error(`Error creating cookbook: ${JSON.stringify(response)}`)
      return false
    }),
    fetch: flow(function* (pageNumber = 1, pageSize = COOKBOOK_LIST_PAGE_SIZE) {
      const isFirstPage = pageNumber === 1
      const hasStaleList = self.cookbookList.items.length > 0

      if (isFirstPage && !hasStaleList) {
        self.listFetchState = FetchState.loading
      }

      const response = yield api.getCookbooks(pageNumber, pageSize)
      if (response.kind === "ok") {
        if (isFirstPage) {
          applyCookbooksFirstPage(
            self,
            response.cookbooks.items,
            response.cookbooks.pageNumber,
            response.cookbooks.totalPages,
            response.cookbooks.totalCount,
          )
          self.listFetchState = FetchState.ready
        } else {
          appendCookbooksPage(self, response.cookbooks.items)
          self.cookbookList.setProp("pageNumber", response.cookbooks.pageNumber)
          self.cookbookList.setProp("totalPages", response.cookbooks.totalPages)
          self.cookbookList.setProp("totalCount", response.cookbooks.totalCount)
        }
        return true
      }
      console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
      if (isFirstPage) {
        self.listFetchState = FetchState.ready
      }
      return false
    }),
    fetchMore: flow(function* () {
      if (self.listLoadMoreState === FetchState.loading) return false
      if (self.cookbookList.pageNumber >= self.cookbookList.totalPages) return false

      self.listLoadMoreState = FetchState.loading
      const nextPage = self.cookbookList.pageNumber + 1
      const response = yield api.getCookbooks(nextPage, COOKBOOK_LIST_PAGE_SIZE)

      if (response.kind === "ok") {
        appendCookbooksPage(self, response.cookbooks.items)
        self.cookbookList.setProp("pageNumber", response.cookbooks.pageNumber)
        self.cookbookList.setProp("totalPages", response.cookbooks.totalPages)
        self.cookbookList.setProp("totalCount", response.cookbooks.totalCount)
        self.listLoadMoreState = FetchState.ready
        return true
      }

      console.error(`Error fetching more cookbooks: ${JSON.stringify(response)}`)
      self.listLoadMoreState = FetchState.ready
      return false
    }),
    fetchAll: flow(function* () {
      const hasStaleList = self.cookbookList.items.length > 0
      if (!hasStaleList) {
        self.listFetchState = FetchState.loading
      }

      let pageNumber = 1
      let totalPages = 1

      while (pageNumber <= totalPages) {
        const response = yield api.getCookbooks(pageNumber, COOKBOOK_LIST_PAGE_SIZE)
        if (response.kind !== "ok") {
          console.error(`Error fetching cookbooks: ${JSON.stringify(response)}`)
          if (pageNumber === 1) {
            self.listFetchState = FetchState.ready
          }
          return false
        }

        if (pageNumber === 1) {
          applyCookbooksFirstPage(
            self,
            response.cookbooks.items,
            response.cookbooks.pageNumber,
            response.cookbooks.totalPages,
            response.cookbooks.totalCount,
          )
          self.listFetchState = FetchState.ready
        } else {
          appendCookbooksPage(self, response.cookbooks.items)
          self.cookbookList.setProp("pageNumber", response.cookbooks.pageNumber)
          self.cookbookList.setProp("totalPages", response.cookbooks.totalPages)
          self.cookbookList.setProp("totalCount", response.cookbooks.totalCount)
        }

        totalPages = response.cookbooks.totalPages
        pageNumber = response.cookbooks.pageNumber + 1
      }

      return true
    }),
    update: flow(function* (cookbook: CookbookSnapshotIn) {
      const response = yield api.updateCookbook(cookbook)
      if (response.kind === "ok") {
        if (self.selected) self.selected.update(cookbook)
        return true
      }
      console.error(`Error updating cookbook: ${JSON.stringify(response)}`)
      return false
    }),
    remove() {
      destroy(self.selected)
    },
    uploadCookbookCover: flow(function* (assets: ImagePicker.ImagePickerAsset[]) {
      const response = yield api.uploadImage(assets)
      if (response.kind === "ok" && response.keys.length > 0) {
        return { ok: true as const, key: response.keys.at(-1) ?? "" }
      }
      return { ok: false as const }
    }),
    setSelectedById(id: number) {
      const cookbook = this.getById(id)
      if (cookbook) self.selected = cookbook
      else self.selected = null
    },
    getById(id: number) {
      return self.cookbookList.items.find((cookbook) => cookbook.id === id)
    },
    addFavorite(cookbook: Cookbook) {
      self.favorites.push(cookbook)
    },
    removeFavorite(cookbook: Cookbook) {
      self.favorites.remove(cookbook)
    },
  }))
  .views((store) => ({
    get cookbooks() {
      return store.cookbookList.items
    },
    get listHasNextPage() {
      return store.cookbookList.pageNumber < store.cookbookList.totalPages
    },
    get isLoadingMoreCookbooks() {
      return store.listLoadMoreState === FetchState.loading
    },
    get isListPending() {
      if (store.cookbookList.items.length > 0) return false
      return store.listFetchState !== FetchState.ready
    },
    get isListEmpty() {
      return store.listFetchState === FetchState.ready && store.cookbookList.items.length === 0
    },
    get cookbooksForList() {
      return store.favoritesOnly ? store.favorites : store.cookbookList.items
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
