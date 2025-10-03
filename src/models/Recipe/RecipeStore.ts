import {
  destroy,
  detach,
  flow,
  Instance,
  SnapshotOut,
  types,
} from "mobx-state-tree"
import { api } from "src/services/api"
import { Recipe, RecipeBriefModel, RecipeModel, RecipeSnapshotIn } from "./Recipe"

import { RecipeToAddModel, RecipeToAddSnapshotIn } from "./RecipeToAdd"

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
    selected: types.maybeNull(RecipeModel),
    recipeToAdd: types.maybeNull(RecipeToAddModel),
  })
  .actions(withSetPropAction)
  .actions((self) => ({
    create: flow(function* (recipeToAdd: RecipeToAddSnapshotIn) {
      const response = yield api.createRecipe(recipeToAdd)
      if (response.kind === "ok") {
        self.selected = null
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
        self.recipes.items.push(RecipeBriefModel.create({id: response.recipeId, title: recipeToAdd.title}))
        self.selected = newRecipe
        return true
      }
      console.error(`Error creating recipe: ${JSON.stringify(response)}`)
      return false
    }),
    single: flow(function* (id: number) {
      // TODO pick one
      self.setProp("selected", null);
      self.selected = null
      const response = yield api.getRecipe(id)
      if (response.kind === "ok") {
        self.setProp("selected", response.recipe);
        return true
      }
      console.error(`Error fetching recipe: ${JSON.stringify(response)}`)
      return false
    }),
    fetch: flow(function* (cookbookId: number, search = "", pageNumber = 1, pageSize = 999) {
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
        else console.error(`Error updating recipe: ${JSON.stringify(response)}`)
        var brief = self.recipes.items.find((recipe) => recipe.id === updatedRecipe.id)
        brief?.update(updatedRecipe.title)

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
