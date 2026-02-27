import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { View } from "react-native"


export default observer(function AddInvitationOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()

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
          title={t("invitationAddOptionsScreen:inviteByEmail")}
          description={t("invitationAddOptionsScreen:inviteByEmailDesc")}
          leftIcon="mail"
          onPress={() => router.replace("../invitation/add-email")}
        />
        <OptionListItem
          title={t("invitationAddOptionsScreen:inviteByLink")}
          description={t("invitationAddOptionsScreen:inviteByLinkDesc")}
          leftIcon="web"
          onPress={() => router.replace("../invitation/add-link")}
        />
      </View>
    </Screen>
  )
})
