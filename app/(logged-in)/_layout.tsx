import { useStores } from "@/models/helpers/useStores"
import { Redirect, Stack } from "expo-router"
import { observer } from "mobx-react-lite"

export default observer(function Layout() {
  const {
    authenticationStore: { isAuthenticated },
  } = useStores()

  if (!isAuthenticated) {
    return <Redirect href="/log-in" />
  }

  return <Stack screenOptions={{ headerShown: false }} />
})
