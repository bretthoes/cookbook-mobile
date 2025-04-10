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
    single: flow(function* (id: number) {
      const response = yield api.getRecipe(id)
      self.selected = null
      if (response.kind === "ok") {
        const index = self.recipes.items.findIndex(r => r.id === id)
        if (index >= 0) // replace existing
          self.recipes.items[index] = response.recipe
        else // add new
          self.recipes.items.push(response.recipe)
        return true
      }
      console.error(`Error fetching recipe: ${JSON.stringify(response)}`)
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
    update: flow(function* (updatedRecipe: RecipeSnapshotIn) {
      const response = yield api.updateRecipe(updatedRecipe)
      if (response.kind === "ok") {
        if (self.selected) self.selected.update(updatedRecipe)
        return true
      }
      console.error(`Error updating recipe: ${JSON.stringify(response)}`)
      return false
    }),
    delete: flow(function* () {
      if (!self.selected) return
      const response = yield api.deleteRecipe(self.selected.id)
      if (response.kind === "ok") {
        destroy(self.selected)
        self.setProp("selected", null)
        return true 
      }
      console.error(`Error deleting recipe: ${JSON.stringify(response)}`)
      return false
    }),
    remove() {
      destroy(self.selected)
      self.setProp("selected", null)
    },
    setSelectedById(id: number) {
      const recipe = this.getById(id)
      if (recipe) self.selected = recipe
      else self.selected = null
    },
    getById(id: number) {
      return self.recipes.items.find((recipe) => recipe.id === id)
    },
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
