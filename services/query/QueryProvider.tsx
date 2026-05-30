import { createAppQueryClient, setQueryClient } from "@/services/query/queryClient"
import { setupQueryPersistence } from "@/services/query/setupQueryPersistence"
import { QueryClientProvider, focusManager, onlineManager } from "@tanstack/react-query"
import { useEffect, useState, type ReactNode } from "react"
import { AppState, type AppStateStatus } from "react-native"

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active")
}

onlineManager.setEventListener((setOnline) => {
  const subscription = AppState.addEventListener("change", (status) => {
    setOnline(status === "active")
  })
  return () => subscription.remove()
})

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    const client = createAppQueryClient()
    setQueryClient(client)
    return client
  })

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange)
    const unsubscribePersist = setupQueryPersistence(queryClient)
    return () => {
      subscription.remove()
      unsubscribePersist()
    }
  }, [queryClient])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
