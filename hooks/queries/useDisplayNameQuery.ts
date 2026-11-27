import { getDisplayName, updateUser } from "@/services/api/wrappers/users"
import { queryKeys } from "@/services/query/queryKeys"
import { unwrapApiResult } from "@/services/query/unwrapApiResult"
import { useIsAuthenticated } from "@/stores/authStore"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"

export function useDisplayNameQuery() {
  const isAuthenticated = useIsAuthenticated()
  return useQuery({
    queryKey: queryKeys.user.displayName(),
    enabled: isAuthenticated,
    queryFn: async () => {
      const data = unwrapApiResult(await getDisplayName())
      return data.displayName
    },
  })
}

export function useUpdateDisplayName() {
  const queryClient = useQueryClient()
  return useCallback(
    async (name: string) => {
      const result = await updateUser(name)
      if (result.kind !== "ok") return false
      queryClient.setQueryData(queryKeys.user.displayName(), name)
      return true
    },
    [queryClient],
  )
}
