import { useIsAuthenticated } from "@/stores/authStore"
import { Redirect, Stack } from "expo-router"

export default function Layout() {
  const isAuthenticated = useIsAuthenticated()

  if (!isAuthenticated) {
    return <Redirect href="/login-options" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
