import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { RecipeModel } from "./Recipe"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { RecipeListModel } from "./RecipeList"

export const RecipeStoreModel = types
  .model("RecipeStore")
  .props({
    recipes: types.maybeNull(RecipeListModel),
    favoritesOnly: false,
    currentRecipe: types.maybeNull(RecipeModel),
    recipeToAdd: types.maybeNull(RecipeModel)
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async fetchRecipes(cookbookId: number, pageNumber = 1, pageSize = 10) {
      const response = await api.getRecipes(cookbookId, pageNumber, pageSize)
      if (response.kind === "ok") {
        store.setProp("recipes", response.recipes)
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
    }
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
