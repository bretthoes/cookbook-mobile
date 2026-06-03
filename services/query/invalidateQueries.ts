import { queryKeys } from "@/services/query/queryKeys"
import type { Query, QueryClient } from "@tanstack/react-query"

/** True for infinite cookbook list queries only (not detail or in-flight). */
export function isCookbookListQuery(query: Query): boolean {
  const key = query.queryKey
  return key[0] === queryKeys.cookbooks.all[0] && key[1] === "list"
}

/** True for infinite recipe list queries only (not detail). */
export function isRecipeListQuery(query: Query): boolean {
  const key = query.queryKey
  return key[0] === queryKeys.recipes.all[0] && key[1] === "list"
}

export function isRecipeListQueryForCookbook(query: Query, cookbookId: string): boolean {
  return isRecipeListQuery(query) && query.queryKey[2] === cookbookId
}

export function invalidateCookbookLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ predicate: isCookbookListQuery })
}

export function invalidateRecipeLists(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ predicate: isRecipeListQuery })
}

export function invalidateRecipeListsForCookbook(queryClient: QueryClient, cookbookId: string) {
  return queryClient.invalidateQueries({
    predicate: (query) => isRecipeListQueryForCookbook(query, cookbookId),
  })
}
