import { Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "../services/api"
import { Recipe, RecipeBriefModel, RecipeModel, RecipeToAddSnapshotIn } from "./Recipe"
import { withSetPropAction } from "./helpers/withSetPropAction"
import { RecipeListModel } from "./RecipeList"

export const RecipeStoreModel = types
  .model("RecipeStore")
  .props({
    recipes: types.maybeNull(RecipeListModel),
    currentRecipe: types.maybeNull(RecipeModel),
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
    },
    async createRecipe(newRecipe: RecipeToAddSnapshotIn) {
      try {
        const response = await api.createRecipe(newRecipe)
        if (response.kind === "ok") {
          const addedRecipe = RecipeModel.create({
            id: response.recipeId,
            title: newRecipe.title,
            summary: newRecipe.summary,
            thumbnail: newRecipe.thumbnail,
            videoPath: newRecipe.videoPath,
            preparationTimeInMinutes: newRecipe.preparationTimeInMinutes,
            cookingTimeInMinutes: newRecipe.cookingTimeInMinutes,
            bakingTimeInMinutes: newRecipe.bakingTimeInMinutes,
            servings: newRecipe.servings,
            directions: newRecipe.directions,
            ingredients: newRecipe.ingredients,
            images: newRecipe.images,
          })
          this.setCurrentRecipe(addedRecipe)

          store.recipes?.items.push(
            RecipeBriefModel.create({
            id: response.recipeId,
            title: newRecipe.title
          }))
        } else {
          console.error(`Error creating recipe: ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error(`Error creating recipe: ${error}`)
      }
    },
    setCurrentRecipe(recipe: Recipe) {
      store.currentRecipe = recipe
    },
    clearCurrentRecipe() {
      store.currentRecipe = null
    },
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
