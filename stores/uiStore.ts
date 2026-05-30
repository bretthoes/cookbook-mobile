import type { RecipeToAddSnapshotIn } from "@/types/recipe"
import type { RecipeDraftItem } from "@/types/recipeDraft"
import {
  getCurrentWeekKey,
  hasDraftContent,
  type DraftFormData,
} from "@/utils/recipeDraftHelpers"
import { formDataToIngredientSectionsSnapshot } from "@/utils/recipeIngredientSections"
import { zustandPersistStorage } from "@/stores/persistStorage"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export {
  getCurrentWeekKey,
  hasDraftContent,
  WEEKLY_IMPORT_LIMIT,
  type DraftFormData,
} from "@/utils/recipeDraftHelpers"

const UI_STORE_KEY = "ui-v1"

function makeDraftId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export interface UiState {
  favoriteCookbookIds: number[]
  selectedCookbookId: number | null
  favoritesOnly: boolean
  drafts: RecipeDraftItem[]
  recipeToAdd: RecipeToAddSnapshotIn | null
  weeklyImportCount: number
  weeklyImportWeekStart: string

  setSelectedCookbookId: (id: number | null) => void
  setFavoritesOnly: (value: boolean) => void
  toggleFavoriteCookbook: (id: number) => void
  hasFavoriteCookbook: (id: number) => boolean

  setRecipeToAdd: (recipe: RecipeToAddSnapshotIn | null) => void
  clearRecipeToAdd: () => void
  incrementImportCount: () => void

  saveDraft: (cookbookId: number, formData: DraftFormData) => void
  deleteDraft: (cookbookId: number) => void
  getDraftForCookbook: (cookbookId: number) => RecipeDraftItem | undefined

  migrateFromLegacySnapshot: (snapshot: LegacyUiSnapshot) => void
}

export type LegacyUiSnapshot = {
  cookbookStore?: {
    favorites?: (number | { id?: number })[]
    favoritesOnly?: boolean
    selected?: number | { id?: number }
  }
  recipeStore?: {
    drafts?: RecipeDraftItem[]
    recipeToAdd?: RecipeToAddSnapshotIn
    weeklyImportCount?: number
    weeklyImportWeekStart?: string
  }
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      favoriteCookbookIds: [],
      selectedCookbookId: null,
      favoritesOnly: false,
      drafts: [],
      recipeToAdd: null,
      weeklyImportCount: 0,
      weeklyImportWeekStart: "",

      setSelectedCookbookId: (id) => set({ selectedCookbookId: id }),

      setFavoritesOnly: (value) => set({ favoritesOnly: value }),

      toggleFavoriteCookbook: (id) => {
        const ids = get().favoriteCookbookIds
        if (ids.includes(id)) {
          set({ favoriteCookbookIds: ids.filter((x) => x !== id) })
        } else {
          set({ favoriteCookbookIds: [...ids, id] })
        }
      },

      hasFavoriteCookbook: (id) => get().favoriteCookbookIds.includes(id),

      setRecipeToAdd: (recipe) => set({ recipeToAdd: recipe }),
      clearRecipeToAdd: () => set({ recipeToAdd: null }),

      incrementImportCount: () => {
        const currentWeek = getCurrentWeekKey()
        const state = get()
        if (state.weeklyImportWeekStart !== currentWeek) {
          set({ weeklyImportCount: 1, weeklyImportWeekStart: currentWeek })
        } else {
          set({ weeklyImportCount: state.weeklyImportCount + 1 })
        }
      },

      saveDraft: (cookbookId, formData) => {
        if (!hasDraftContent(formData)) {
          get().deleteDraft(cookbookId)
          return
        }

        const validIngredientSections = formDataToIngredientSectionsSnapshot(
          { ingredientSections: formData.ingredientSections },
          { sectionIds: "reset" },
        )
        const validDirections = formData.directions
          .filter((d) => d.text?.trim())
          .map((d, idx) => ({
            id: 0,
            text: d.text.trim(),
            ordinal: idx + 1,
            image: d.image ?? null,
          }))
        const validImages = formData.images
          .filter((img) => img?.trim())
          .map((img, idx) => ({ id: 0, name: img.trim(), ordinal: idx + 1 }))

        const existing = get().drafts.find((d) => d.cookbookId === cookbookId)
        const draftFields = {
          savedAt: new Date(),
          title: formData.title,
          summary: formData.summary ?? null,
          preparationTimeInMinutes: formData.preparationTimeInMinutes ?? null,
          cookingTimeInMinutes: formData.cookingTimeInMinutes ?? null,
          bakingTimeInMinutes: formData.bakingTimeInMinutes ?? null,
          servings: formData.servings ?? null,
          ingredientSections: validIngredientSections,
          directions: validDirections,
          images: validImages,
          isVegetarian: formData.isVegetarian ?? null,
          isVegan: formData.isVegan ?? null,
          isGlutenFree: formData.isGlutenFree ?? null,
          isDairyFree: formData.isDairyFree ?? null,
          isCheap: formData.isCheap ?? null,
          isHealthy: formData.isHealthy ?? null,
          isLowFodmap: formData.isLowFodmap ?? null,
          isHighProtein: formData.isHighProtein ?? null,
          isBreakfast: formData.isBreakfast ?? null,
          isLunch: formData.isLunch ?? null,
          isDinner: formData.isDinner ?? null,
          isDessert: formData.isDessert ?? null,
          isSnack: formData.isSnack ?? null,
        }

        if (existing) {
          set({
            drafts: get().drafts.map((d) =>
              d.cookbookId === cookbookId
                ? {
                    ...d,
                    ...draftFields,
                    savedAt: draftFields.savedAt.toISOString() as unknown as Date,
                  }
                : d,
            ),
          })
        } else {
          set({
            drafts: [
              ...get().drafts,
              {
                draftId: makeDraftId(),
                cookbookId,
                thumbnail: null,
                videoPath: null,
                ...draftFields,
                savedAt: draftFields.savedAt.toISOString() as unknown as Date,
              },
            ],
          })
        }
      },

      deleteDraft: (cookbookId) => {
        set({ drafts: get().drafts.filter((d) => d.cookbookId !== cookbookId) })
      },

      getDraftForCookbook: (cookbookId) => get().drafts.find((d) => d.cookbookId === cookbookId),

      migrateFromLegacySnapshot: (snapshot) => {
        const cs = snapshot.cookbookStore
        const rs = snapshot.recipeStore
        if (!cs && !rs) return

        const patch: Partial<UiState> = {}

        if (cs) {
          if (typeof cs.favoritesOnly === "boolean") patch.favoritesOnly = cs.favoritesOnly
          const favIds = Array.isArray(cs.favorites)
            ? cs.favorites.map((f: number | { id?: number }) =>
                typeof f === "number" ? f : (f?.id ?? 0),
              )
            : []
          if (favIds.length > 0) patch.favoriteCookbookIds = favIds.filter(Boolean)
          if (cs.selected != null) {
            const selId =
              typeof cs.selected === "number" ? cs.selected : (cs.selected as { id?: number })?.id
            if (selId != null) patch.selectedCookbookId = selId
          }
        }

        if (rs) {
          if (Array.isArray(rs.drafts) && rs.drafts.length > 0) {
            patch.drafts = rs.drafts as RecipeDraftItem[]
          }
          if (rs.recipeToAdd) patch.recipeToAdd = rs.recipeToAdd as RecipeToAddSnapshotIn
          if (typeof rs.weeklyImportCount === "number")
            patch.weeklyImportCount = rs.weeklyImportCount
          if (typeof rs.weeklyImportWeekStart === "string") {
            patch.weeklyImportWeekStart = rs.weeklyImportWeekStart
          }
        }

        if (Object.keys(patch).length > 0) {
          set(patch)
        }
      },
    }),
    {
      name: UI_STORE_KEY,
      storage: createJSONStorage(() => zustandPersistStorage),
      partialize: (state) => ({
        favoriteCookbookIds: state.favoriteCookbookIds,
        selectedCookbookId: state.selectedCookbookId,
        favoritesOnly: state.favoritesOnly,
        drafts: state.drafts,
        weeklyImportCount: state.weeklyImportCount,
        weeklyImportWeekStart: state.weeklyImportWeekStart,
      }),
    },
  ),
)

export function draftHasContent(draft: RecipeDraftItem): boolean {
  if (draft.title?.trim()) return true
  if (draft.summary?.trim()) return true
  if (draft.images?.some((img) => img.name?.trim())) return true
  if (draft.directions?.some((d) => d.text?.trim() || d.image)) return true
  return (
    draft.ingredientSections?.some((section) =>
      section.ingredients?.some((ingredient) => ingredient.name?.trim()),
    ) ?? false
  )
}
