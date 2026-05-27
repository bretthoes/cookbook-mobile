import { Redirect, useLocalSearchParams } from "expo-router"

/** Deep link entry for https://sharedcookbook.com/invite/?t=<token> */
export default function InviteLinkScreen() {
  const { t } = useLocalSearchParams<{ t?: string | string[] }>()
  const token = Array.isArray(t) ? t[0] : t

  if (!token) {
    return <Redirect href="/" />
  }

  return <Redirect href={`/i/${token}`} />
}
