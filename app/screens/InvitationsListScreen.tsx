import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
// import { useNavigation } from "@react-navigation/native"
import { useStores } from "app/models"
import { delay } from "app/utils/delay"

interface InvitationsListScreenProps extends AppStackScreenProps<"InvitationsList"> {}

export const InvitationsListScreen: FC<InvitationsListScreenProps> = observer(function InvitationsListScreen() {
  // TODO add invitations store
  // TODO add cards with cookbook image of pending invite,
  // the user who invited you, and an option to accept or reject.
  // On action, card disappears from list and toast is shown with confirmation.
   const { invitationStore } = useStores()
   const [refreshing, setRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

   useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await invitationStore.fetchInvitations()
      setIsLoading(false)
    })()
  }, [invitationStore])

  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([invitationStore.fetchInvitations(), delay(750)])
    setRefreshing(false)
  }

  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll">
      <Text text="invitationsList" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
