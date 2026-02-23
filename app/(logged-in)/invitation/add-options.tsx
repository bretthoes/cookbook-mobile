import { OptionListItem, $container, $listContainer } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { translate } from "@/i18n"
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
    titleTx: "invitationAddOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <OptionListItem
          title={translate("invitationAddOptionsScreen:inviteByEmail")}
          description={translate("invitationAddOptionsScreen:inviteByEmailDesc")}
          leftIcon="mail"
          onPress={() => router.replace("../invitation/add-email")}
        />
        <OptionListItem
          title={translate("invitationAddOptionsScreen:inviteByLink")}
          description={translate("invitationAddOptionsScreen:inviteByLinkDesc")}
          leftImage={link}
          onPress={() => router.replace("../invitation/add-link")}
        />
      </View>
    </Screen>
  )
})
