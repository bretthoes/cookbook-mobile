export type PaginatedList<T> = {
  items: T[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}

export const emptyPaginatedList = <T>(): PaginatedList<T> => ({
  items: [],
  pageNumber: 1,
  totalPages: 1,
  totalCount: 0,
})
