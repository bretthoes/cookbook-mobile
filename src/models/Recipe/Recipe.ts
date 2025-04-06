import { Instance, SnapshotIn, SnapshotOut, types } from "mobx-state-tree"
import { withSetPropAction } from "../helpers/withSetPropAction"
import { RecipeDirectionModel } from "./RecipeDirection"
import { RecipeIngredientModel } from "./RecipeIngredient"
import { RecipeImageModel } from "./RecipeImage"
import { translate } from "src/i18n"

/**
 * This represents a recipe.
 */
export const RecipeModel = types
  .model("Recipe")
  .props({
    id: types.identifierNumber,
    title: types.string,
    author: types.maybeNull(types.string),
    authorEmail: types.maybeNull(types.string),
    summary: types.maybeNull(types.string),
    thumbnail: types.maybeNull(types.string),
    videoPath: types.maybeNull(types.string),
    preparationTimeInMinutes: types.maybeNull(types.integer),
    cookingTimeInMinutes: types.maybeNull(types.integer),
    bakingTimeInMinutes: types.maybeNull(types.integer),
    servings: types.maybeNull(types.integer),
    directions: types.array(RecipeDirectionModel) ?? [],
    ingredients: types.array(RecipeIngredientModel) ?? [],
    images: types.array(RecipeImageModel) ?? [],
    isVegetarian: types.maybeNull(types.boolean),
    isVegan: types.maybeNull(types.boolean),
    isGlutenFree: types.maybeNull(types.boolean),
    isDairyFree: types.maybeNull(types.boolean),
    isCheap: types.maybeNull(types.boolean),
    isHealthy: types.maybeNull(types.boolean),
    isLowFodmap: types.maybeNull(types.boolean),
  })
.actions(withSetPropAction)
  .views((recipe) => ({
    get parsedTitleAndSubtitle() {
      const defaultValue = { title: recipe.title?.trim() }

      if (!defaultValue.title) return defaultValue

      const titleMatches = defaultValue.title.match(/^(RNR.*\d)(?: - )(.*$)/)

      if (!titleMatches || titleMatches.length !== 3) return defaultValue

      return { title: titleMatches[1], subtitle: titleMatches[2] }
    },
    get duration() {
      const seconds = Number(recipe.preparationTimeInMinutes)
      const h = Math.floor(seconds / 3600)
      const m = Math.floor((seconds % 3600) / 60)
      const s = Math.floor((seconds % 3600) % 60)

      const hDisplay = h > 0 ? `${h}:` : ""
      const mDisplay = m > 0 ? `${m}:` : ""
      const sDisplay = s > 0 ? s : ""
      return {
        textLabel: hDisplay + mDisplay + sDisplay,
        accessibilityLabel: translate("demoPodcastListScreen:accessibility.durationLabel", {
          hours: h,
          minutes: m,
          seconds: s,
        }),
      }
    },
  }))

export interface Recipe extends Instance<typeof RecipeModel> {}
export interface RecipeSnapshotOut extends SnapshotOut<typeof RecipeModel> {}
export interface RecipeSnapshotIn extends SnapshotIn<typeof RecipeModel> {}
