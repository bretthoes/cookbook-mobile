import { ListItem } from "@/components/ListItem"
import { SectionCard } from "@/components/SectionCard"
import { Text } from "@/components/Text"
import { GETTING_STARTED_DEV_PREVIEW_KEY, gettingStartedResetKeys } from "@/utils/gettingStarted"
import { remove, storage } from "@/utils/storage"
import * as Application from "expo-application"
import { useRouter } from "expo-router"
import { View } from "react-native"

function fabricEnabled() {
  return (
    "nativeFabricUIManager" in globalThis &&
    (globalThis as Record<string, unknown>).nativeFabricUIManager != null
  )
}

export function ProfileDevTools({ userId }: { userId: string | undefined }) {
  const router = useRouter()
  if (!__DEV__) return null

  return (
    <SectionCard headingTx="demoDebugScreen:title">
      <ListItem
        tx="demoDebugScreen:previewGettingStarted"
        bottomSeparator
        onPress={() => {
          for (const key of gettingStartedResetKeys(userId)) remove(key)
          storage.set(GETTING_STARTED_DEV_PREVIEW_KEY, true)
          router.navigate("/(logged-in)/(tabs)/cookbooks")
        }}
      />
      <ListItem
        tx="demoDebugScreen:previewLoadingScreen"
        bottomSeparator
        onPress={() => router.push("/(logged-in)/recipe/loading-preview")}
      />
      <ListItem
        tx="demoDebugScreen:previewSignInProgress"
        bottomSeparator
        onPress={() =>
          router.push({
            pathname: "/(logged-in)/recipe/loading-preview",
            params: { variant: "signIn" },
          })
        }
      />
      <ListItem
        LeftComponent={
          <View>
            <Text preset="bold" tx="demoDebugScreen:appId" />
            <Text>{Application.applicationId}</Text>
          </View>
        }
      />
      <ListItem
        LeftComponent={
          <View>
            <Text preset="bold" tx="demoDebugScreen:appName" />
            <Text>{Application.applicationName}</Text>
          </View>
        }
      />
      <ListItem
        LeftComponent={
          <View>
            <Text preset="bold" tx="demoDebugScreen:appVersion" />
            <Text>{Application.nativeApplicationVersion}</Text>
          </View>
        }
      />
      <ListItem
        LeftComponent={
          <View>
            <Text preset="bold" tx="demoDebugScreen:appBuildVersion" />
            <Text>{Application.nativeBuildVersion}</Text>
          </View>
        }
      />
      <ListItem
        LeftComponent={
          <View>
            <Text preset="bold" tx="demoDebugScreen:hermesEnabled" />
            <Text>{String(typeof HermesInternal === "object" && HermesInternal !== null)}</Text>
          </View>
        }
      />
      <ListItem
        LeftComponent={
          <View>
            <Text preset="bold" tx="demoDebugScreen:fabricEnabled" />
            <Text>{String(fabricEnabled())}</Text>
          </View>
        }
      />
    </SectionCard>
  )
}
