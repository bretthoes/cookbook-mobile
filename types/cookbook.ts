import type { components } from "@/services/api/generated/schema"

export type CookbookItem = components["schemas"]["CookbookBriefDto"] & {
  id: string
  title: string
}

export type CookbookToAdd = {
  title: string
  image?: string | null
}

export type CookbookToAddSnapshotIn = CookbookToAdd
export type CookbookSnapshotIn = CookbookItem
export type Cookbook = CookbookItem

export type CookbookListPage = components["schemas"]["PaginatedListOfCookbookBriefDto"]
export type CookbookListSnapshotIn = import("@/types/pagination").PaginatedList<CookbookItem>
