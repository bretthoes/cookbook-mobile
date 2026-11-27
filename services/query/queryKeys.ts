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
  invitations: {
    all: ["invitations"] as const,
    list: () => [...queryKeys.invitations.all, "list"] as const,
    token: (token: string) => [...queryKeys.invitations.all, "token", token] as const,
  },
  user: {
    all: ["user"] as const,
    displayName: () => [...queryKeys.user.all, "displayName"] as const,
  },
} as const
