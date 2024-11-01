import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Screen, Text } from "app/components"
import { useStores } from "app/models"
import { delay } from "app/utils/delay"
// import { useNavigation } from "@react-navigation/native"

interface MembersListScreenProps extends AppStackScreenProps<"MembersList"> {}

export const MembersListScreen: FC<MembersListScreenProps> = observer(function MembersListScreen() {
  const { membershipStore, cookbookStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await membershipStore.fetchMemberships(cookbookStore.currentCookbook?.id ?? 0)
      setIsLoading(false)
    })()
  }, [membershipStore])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([
      await membershipStore.fetchMemberships(cookbookStore.currentCookbook?.id ?? 0, membershipStore.memberships?.pageNumber),
      delay(750),
    ])
    setRefreshing(false)
  }

  const handleNextPage = async () => {
    if (membershipStore.memberships?.hasNextPage) {
      setIsLoading(true)
      await membershipStore.fetchMemberships(
        cookbookStore.currentCookbook?.id ?? 0,
        membershipStore.memberships.pageNumber + 1,
      )
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (membershipStore.memberships?.hasPreviousPage) {
      setIsLoading(true)
      await membershipStore.fetchMemberships(
        cookbookStore.currentCookbook?.id ?? 0,
        membershipStore.memberships.pageNumber - 1,
      )
      setIsLoading(false)
    }
  }

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
