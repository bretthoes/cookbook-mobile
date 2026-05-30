export const queryKeys = {
  cookbooks: {
    all: ["cookbooks"] as const,
    list: () => [...queryKeys.cookbooks.all, "list"] as const,
  },
  recipes: {
    all: ["recipes"] as const,
    list: (cookbookId: number, search: string) =>
      [...queryKeys.recipes.all, "list", cookbookId, search] as const,
    detail: (recipeId: number) => [...queryKeys.recipes.all, "detail", recipeId] as const,
  },
} as const
