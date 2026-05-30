import { COOKBOOK_LIST_PAGE_SIZE } from "@/constants/pagination"
import { invalidateCookbookLists } from "@/services/query/invalidateQueries"
import { queryKeys } from "@/services/query/queryKeys"
import { unwrapApiResult } from "@/services/query/unwrapApiResult"
import { api } from "@/services/api"
import type {
  CookbookItem,
  CookbookListPage,
  CookbookSnapshotIn,
  CookbookToAddSnapshotIn,
} from "@/types/cookbook"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query"
import { getCookbooks } from "@/services/api/wrappers/cookbooks"
import { useUiStore } from "@/stores/uiStore"

type CookbookListPageData = {
  items: CookbookItem[]
  pageNumber: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
}

function normalizeCookbookList(page: CookbookListPage): CookbookListPageData {
  return {
    items: (page.items ?? []) as CookbookItem[],
    pageNumber: page.pageNumber ?? 1,
    totalPages: page.totalPages ?? 1,
    totalCount: page.totalCount ?? 0,
    hasNextPage: page.hasNextPage ?? false,
  }
}

async function fetchCookbooksPage(pageNumber: number) {
  const result = await getCookbooks(pageNumber, COOKBOOK_LIST_PAGE_SIZE)
  const data = unwrapApiResult(result)
  return normalizeCookbookList(data.cookbooks)
}

export function useCookbooksInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.cookbooks.list(),
    queryFn: ({ pageParam }) => fetchCookbooksPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageNumber < lastPage.totalPages ? lastPage.pageNumber + 1 : undefined,
  })
}

export function useCookbooksList() {
  const query = useCookbooksInfiniteQuery()
  const cookbooks = query.data?.pages.flatMap((p) => p.items) ?? []
  const lastPage = query.data?.pages.at(-1)
  return {
    ...query,
    cookbooks,
    listHasNextPage: (lastPage?.pageNumber ?? 1) < (lastPage?.totalPages ?? 1),
    isListPending: query.isPending && cookbooks.length === 0,
    isListEmpty: query.isSuccess && cookbooks.length === 0,
    isLoadingMore: query.isFetchingNextPage,
  }
}

export function findCookbookInCache(
  data: InfiniteData<{ items: CookbookItem[] }> | undefined,
  id: number | null | undefined,
): CookbookItem | undefined {
  if (id == null || !data) return undefined
  for (const page of data.pages) {
    const found = page.items.find((c) => c.id === id)
    if (found) return found
  }
  return undefined
}

export function useCookbookById(cookbookId: number | null | undefined) {
  const query = useCookbooksInfiniteQuery()
  const cookbook = findCookbookInCache(query.data, cookbookId)
  return { cookbook, isLoading: query.isLoading && !cookbook, query }
}

export function useSelectedCookbook() {
  const selectedCookbookId = useUiStore((s) => s.selectedCookbookId)
  return useCookbookById(selectedCookbookId)
}

export async function fetchAllCookbooksPages(queryClient: ReturnType<typeof useQueryClient>) {
  let pageNumber = 1
  let totalPages = 1
  const allItems: CookbookItem[] = []

  while (pageNumber <= totalPages) {
    const page = await fetchCookbooksPage(pageNumber)
    allItems.push(...page.items)
    totalPages = page.totalPages
    pageNumber = page.pageNumber + 1
  }

  queryClient.setQueryData<InfiniteData<CookbookListPageData>>(queryKeys.cookbooks.list(), {
    pages: [
      {
        items: allItems,
        pageNumber: 1,
        totalPages: 1,
        totalCount: allItems.length,
        hasNextPage: false,
      },
    ],
    pageParams: [1],
  })

  return allItems
}

export function useCreateCookbookMutation() {
  const queryClient = useQueryClient()
  const setSelectedCookbookId = useUiStore((s) => s.setSelectedCookbookId)

  return useMutation({
    mutationFn: async (cookbook: CookbookToAddSnapshotIn) => {
      const result = await api.createCookbook(cookbook)
      return unwrapApiResult(result)
    },
    onSuccess: async (data) => {
      setSelectedCookbookId(data.cookbookId)
      await invalidateCookbookLists(queryClient)
    },
  })
}

export function useUpdateCookbookMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (cookbook: CookbookSnapshotIn) => {
      const result = await api.updateCookbook(cookbook)
      if (result.kind !== "ok") throw new Error(result.kind)
      return cookbook
    },
    onSuccess: (cookbook) => {
      queryClient.setQueriesData<InfiniteData<{ items: CookbookItem[] }>>(
        { queryKey: queryKeys.cookbooks.list() },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((item) =>
                item.id === cookbook.id
                  ? {
                      ...item,
                      title: cookbook.title,
                      image: cookbook.image ?? null,
                    }
                  : item,
              ),
            })),
          }
        },
      )
    },
  })
}

export function useUploadCookbookCoverMutation() {
  return useMutation({
    mutationFn: async (assets: Parameters<typeof api.uploadImage>[0]) => {
      try {
        const response = await api.uploadImage(assets)
        const data = unwrapApiResult(response)
        const key = data.keys.at(-1) ?? ""
        return { ok: true as const, key }
      } catch {
        return { ok: false as const }
      }
    },
  })
}
