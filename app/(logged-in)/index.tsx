import { Redirect } from "expo-router"

export default function LoggedInIndex() {
  return <Redirect href="/(logged-in)/(tabs)/cookbooks" />
}
