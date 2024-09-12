import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { RecipeBrief, RecipeBriefModel, RecipeModel } from "./Recipe"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { PaginationModel } from "./Pagination"

export const RecipeStoreModel = types
  .model("RecipeStore")
  .props({
    recipes: types.array(RecipeBriefModel),
    favorites: types.array(types.reference(RecipeBriefModel)),
    favoritesOnly: false,
    currentRecipe: types.maybeNull(RecipeModel),
    pagination: types.maybeNull(PaginationModel),
    pageNumber: types.optional(types.number, 1),
    totalPages: types.optional(types.number, 1),
    totalCount: types.optional(types.number, 0),
    hasPreviousPage: types.optional(types.boolean, false),
    hasNextPage: types.optional(types.boolean, false),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async fetchRecipes(cookbookId: number, pageNumber = 1, pageSize = 10) {
      const response = await api.getRecipes(cookbookId, pageNumber, pageSize)
      if (response.kind === "ok") {
        store.setProp("recipes", response.recipes)
        store.setProp("pagination", response.pagination)
      } else {
        console.error(`Error fetching recipes: ${JSON.stringify(response)}`)
      }
    },
    async fetchRecipe(recipeId: number) {
      const response = await api.getRecipe(recipeId)
      if (response.kind === "ok") {
        store.setProp("currentRecipe", response.recipe)
      } else {
        console.error(`Error fetching recipe: ${JSON.stringify(response)}`)
      }
    },
    addFavorite(recipe: RecipeBrief) {
      store.favorites.push(recipe)
    },
    removeFavorite(recipe: RecipeBrief) {
      store.favorites.remove(recipe)
    },
  }))
  .views((store) => ({
    get recipesForList() {
      return store.favoritesOnly ? store.favorites : store.recipes
    },

    hasFavorite(recipe: RecipeBrief) {
      return store.favorites.includes(recipe)
    },
  }))
  .actions((store) => ({
    toggleFavorite(recipe: RecipeBrief) {
      if (store.hasFavorite(recipe)) {
        store.removeFavorite(recipe)
      } else {
        store.addFavorite(recipe)
      }
    },
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
