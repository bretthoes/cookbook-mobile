import type { components } from "@/services/api/generated/schema"
import type { PaginatedList } from "@/types/pagination"

export type CookbookItem = components["schemas"]["CookbookBriefDto"] & {
  id: string
  title: string
}

export type CookbookToAdd = {
  title: string
  image?: string | null
}

export type Cookbook = CookbookItem

export type CookbookListPage = components["schemas"]["PaginatedListOfCookbookBriefDto"]
export type CookbookList = PaginatedList<CookbookItem>
