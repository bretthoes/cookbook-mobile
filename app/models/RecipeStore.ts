import { flow, Instance, SnapshotOut, types } from "mobx-state-tree"
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
      this.clearCurrentRecipe()
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
    createRecipe: flow(function* (recipeToAdd: RecipeToAddSnapshotIn) {
      try {
        const response = yield api.createRecipe(recipeToAdd)
        if (response.kind === "ok") {
          const newRecipe = RecipeModel.create({
            id: response.recipeId,
            title: recipeToAdd.title,
            summary: recipeToAdd.summary,
            thumbnail: recipeToAdd.thumbnail,
            videoPath: recipeToAdd.videoPath,
            preparationTimeInMinutes: recipeToAdd.preparationTimeInMinutes,
            cookingTimeInMinutes: recipeToAdd.cookingTimeInMinutes,
            bakingTimeInMinutes: recipeToAdd.bakingTimeInMinutes,
            servings: recipeToAdd.servings,
            directions: recipeToAdd.directions,
            ingredients: recipeToAdd.ingredients,
            images: recipeToAdd.images,
          })
          const newRecipeBrief = RecipeBriefModel.create({
            id: response.recipeId,
            title: recipeToAdd.title
          })

          store.currentRecipe = newRecipe
          store.recipes?.items.push(newRecipeBrief)
        } else {
          console.error(`Error creating recipe: ${JSON.stringify(response)}`)
        }
      } catch (error) {
        console.error(`Error creating recipe: ${error}`)
      }
    }),
    setCurrentRecipe(recipe: Recipe) {
      store.currentRecipe = recipe
    },
    clearCurrentRecipe() {
      store.currentRecipe = null
    },
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
