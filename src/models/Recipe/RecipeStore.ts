import { destroy, detach, flow, Instance, SnapshotOut, types } from "mobx-state-tree"
import { api } from "src/services/api"
import { Recipe, RecipeModel } from "./Recipe"
import { RecipeSnapshotIn } from "./Recipe"
import { RecipeToAddModel } from "./RecipeToAdd"
import { RecipeToAddSnapshotIn } from "./RecipeToAdd"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { RecipeListModel } from "src/models/generics"

export const RecipeStoreModel = types
  .model("RecipeStore")
  .props({
    recipes: types.optional(RecipeListModel, {
      items: [],
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
    }),
    selected: types.maybeNull(types.reference(RecipeModel)),
    recipeToAdd: types.maybeNull(RecipeToAddModel),
  })
  .actions(withSetPropAction)
  .actions((store) => ({
    async fetch(cookbookId: number, search = "", pageNumber = 1, pageSize = 15) {
      this.clearselected()
      const response = await api.getRecipes(cookbookId, search, pageNumber, pageSize)
      if (response.kind === "ok") {
        store.setProp("recipes", response.recipes)
      } else {
        console.error(`Error fetching recipes: ${JSON.stringify(response)}`)
      }
    },
    remove() {
      destroy(store.selected)
      store.setProp("selected", null)
    },
    async single(recipeId: number) {
      const response = await api.getRecipe(recipeId)
      if (response.kind === "ok") {
        //store.setProp("selected", response.recipe)
      } else {
        console.error(`Error fetching recipe: ${JSON.stringify(response)}`)
      }
    },
    async create() {
      if (!store.recipeToAdd) return
      const response = await api.createRecipe(store.recipeToAdd)
      if (response.kind === "ok") {
        const newRecipe = RecipeModel.create({
          id: response.recipeId,
          title: store.recipeToAdd.title,
          summary: store.recipeToAdd.summary,
          thumbnail: store.recipeToAdd.thumbnail,
          videoPath: store.recipeToAdd.videoPath,
          preparationTimeInMinutes: store.recipeToAdd.preparationTimeInMinutes,
          cookingTimeInMinutes: store.recipeToAdd.cookingTimeInMinutes,
          bakingTimeInMinutes: store.recipeToAdd.bakingTimeInMinutes,
          servings: store.recipeToAdd.servings,
          directions: store.recipeToAdd.directions,
          ingredients: store.recipeToAdd.ingredients,
          images: store.recipeToAdd.images,
        })

        store.selected = newRecipe
        store.recipes.items.push(newRecipe)
      } else {
        console.error(`Error creating recipe: ${JSON.stringify(response)}`)
      }
    },
    // TODO move this recipeToAdd into store; can test removing flow
    createRecipe: flow(function* (recipeToAdd: RecipeToAddSnapshotIn) {
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

        store.selected = newRecipe
        store.recipes.items.push(newRecipe)
      } else {
        console.error(`Error creating recipe: ${JSON.stringify(response)}`)
      }
    }),
    updateRecipe: flow(function* (updatedRecipe: RecipeSnapshotIn) {
      const response = yield api.updateRecipe(updatedRecipe)
      if (response.kind === "ok") {
        if (store.selected) {
          const newRecipe = RecipeModel.create({
            id: store.selected.id,
            title: updatedRecipe.title,
            summary: updatedRecipe.summary,
            thumbnail: updatedRecipe.thumbnail,
            videoPath: updatedRecipe.videoPath,
            authorEmail: store.selected.authorEmail,
            author: store.selected.author,
            preparationTimeInMinutes: updatedRecipe.preparationTimeInMinutes,
            cookingTimeInMinutes: updatedRecipe.cookingTimeInMinutes,
            bakingTimeInMinutes: updatedRecipe.bakingTimeInMinutes,
            servings: updatedRecipe.servings,
            directions: updatedRecipe.directions,
            ingredients: updatedRecipe.ingredients,
            images: updatedRecipe.images,
          })
          detach(store.selected)
          //store.setProp("selected", newRecipe)
        }
      } else {
        console.error(`Error updating recipe: ${JSON.stringify(response)}`)
      }
    }),
    deleteRecipe: flow(function* () {
      if (!store.selected) return
      const response = yield api.deleteRecipe(store.selected.id)
      if (response.kind === "ok") {
        destroy(store.selected)
        store.setProp("selected", null)
      } else {
        console.error(`Error deleting recipe: ${JSON.stringify(response)}`)
      }
    }),
    setRecipeToAdd(recipeToAddSnapshot: RecipeToAddSnapshotIn) {
      const recipeToAddInstance = RecipeToAddModel.create(recipeToAddSnapshot)
      store.setProp("recipeToAdd", recipeToAddInstance)
    },
    clearRecipeToAdd() {
      store.recipeToAdd = null
    },
    setselected(recipe: Recipe) {
      store.selected = recipe
    },
    clearselected() {
      store.selected = null
    },
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
