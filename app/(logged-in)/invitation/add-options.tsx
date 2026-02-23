import { OptionListItem, $container, $listContainer } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { View } from "react-native"

const link = require("../../../assets/images/link.png")

export default observer(function AddInvitationOptionsScreen() {
  const { themed } = useAppTheme()

  useHeader({
    leftIcon: "back",
    title: "Invite Friends",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <OptionListItem
          title="Invite by Email"
          description="Send an invitation directly to their email"
          leftIcon="mail"
          onPress={() => router.replace("../invitation/add-email")}
        />
        <OptionListItem
          title="Invite by Shared Link"
          description="Create a shareable link for anyone to join"
          leftImage={link}
          onPress={() => router.replace("../invitation/add-link")}
        />
      </View>
    </Screen>
  )
})
