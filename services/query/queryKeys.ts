export const queryKeys = {
  cookbooks: {
    all: ["cookbooks"] as const,
    list: () => [...queryKeys.cookbooks.all, "list"] as const,
  },
  recipes: {
    all: ["recipes"] as const,
    list: (cookbookId: string, search: string) =>
      [...queryKeys.recipes.all, "list", cookbookId, search] as const,
    detail: (recipeId: string) => [...queryKeys.recipes.all, "detail", recipeId] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: () => [...queryKeys.notifications.all, "list"] as const,
    latest: () => [...queryKeys.notifications.all, "latest"] as const,
  },
} as const
