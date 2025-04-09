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
  .actions((self) => ({
    create: flow(function* (recipeToAdd: RecipeToAddSnapshotIn) {
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
        self.recipes.items.push(newRecipe)
        self.selected = newRecipe
        return true
      }
      console.error(`Error creating recipe: ${JSON.stringify(response)}`)
      return false
    }),
    fetch: flow(function* (
      cookbookId: number,
      search = "",
      pageNumber = 1,
      pageSize = 15
    ) {
      const response = yield api.getRecipes(cookbookId, search, pageNumber, pageSize)
      if (response.kind === "ok") {
        self.setProp("recipes", response.recipes)
        return true
      }
      console.error(`Error fetching recipes: ${JSON.stringify(response)}`)
      return false
    }),
    remove() {
      destroy(self.selected)
      self.setProp("selected", null)
    },
    async single(recipeId: number) {
      const response = await api.getRecipe(recipeId)
      if (response.kind === "ok") {
        //store.setProp("selected", response.recipe)
      } else {
        console.error(`Error fetching recipe: ${JSON.stringify(response)}`)
      }
    },
    updateRecipe: flow(function* (updatedRecipe: RecipeSnapshotIn) {
      const response = yield api.updateRecipe(updatedRecipe)
      if (response.kind === "ok") {
        if (self.selected) {
          const newRecipe = RecipeModel.create({
            id: self.selected.id,
            title: updatedRecipe.title,
            summary: updatedRecipe.summary,
            thumbnail: updatedRecipe.thumbnail,
            videoPath: updatedRecipe.videoPath,
            authorEmail: self.selected.authorEmail,
            author: self.selected.author,
            preparationTimeInMinutes: updatedRecipe.preparationTimeInMinutes,
            cookingTimeInMinutes: updatedRecipe.cookingTimeInMinutes,
            bakingTimeInMinutes: updatedRecipe.bakingTimeInMinutes,
            servings: updatedRecipe.servings,
            directions: updatedRecipe.directions,
            ingredients: updatedRecipe.ingredients,
            images: updatedRecipe.images,
          })
          detach(self.selected)
          //store.setProp("selected", newRecipe)
        }
      } else {
        console.error(`Error updating recipe: ${JSON.stringify(response)}`)
      }
    }),
    deleteRecipe: flow(function* () {
      if (!self.selected) return
      const response = yield api.deleteRecipe(self.selected.id)
      if (response.kind === "ok") {
        destroy(self.selected)
        self.setProp("selected", null)
      } else {
        console.error(`Error deleting recipe: ${JSON.stringify(response)}`)
      }
    }),
    setRecipeToAdd(recipeToAddSnapshot: RecipeToAddSnapshotIn) {
      const recipeToAddInstance = RecipeToAddModel.create(recipeToAddSnapshot)
      self.setProp("recipeToAdd", recipeToAddInstance)
    },
    clearRecipeToAdd() {
      self.recipeToAdd = null
    },
    setselected(recipe: Recipe) {
      self.selected = recipe
    },
    clearselected() {
      self.selected = null
    },
  }))

export interface RecipeStore extends Instance<typeof RecipeStoreModel> {}
export interface RecipeStoreSnapshot extends SnapshotOut<typeof RecipeStoreModel> {}
