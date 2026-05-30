import { QueryClient } from "@tanstack/react-query"

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
      },
    },
  })
}

let appQueryClient: QueryClient | undefined

export function getQueryClient() {
  if (!appQueryClient) {
    appQueryClient = createAppQueryClient()
  }
  return appQueryClient
}

export function setQueryClient(client: QueryClient) {
  appQueryClient = client
}

export function clearQueryClient() {
  getQueryClient().clear()
}
