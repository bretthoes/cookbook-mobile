import React, { FC } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { useStores } from "app/models"
// import { useNavigation } from "@react-navigation/native"

interface MembersListScreenProps extends AppStackScreenProps<"MembersList"> {}

export const MembersListScreen: FC<MembersListScreenProps> = observer(function MembersListScreen() {
  const { MembershipStore } = useStores()
  // TODO load async fetch from membership store

  // TODO navigate to invite screen OR membership details screen
  // Pull in navigation via hook
  // const navigation = useNavigation()
  return (
    <Screen style={$root} preset="scroll">
      <Text text="membersList" />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}
