import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, ImageStyle, View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { EmptyState, ListView, Screen, Text } from "app/components"
import { Invitation, useStores } from "app/models"
import { delay } from "app/utils/delay"
import { spacing } from "app/theme"
import { ContentStyle } from "@shopify/flash-list"
import { isRTL } from "app/i18n"
import { InvitationCard } from "./InvitationCard"

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
    <Screen
      style={$root}
      preset="scroll"
      safeAreaEdges={["top"]}>
      <ListView<Invitation>
          contentContainerStyle={$listContentContainer}
          data={invitationStore.invitations?.items}
          refreshing={refreshing}
          estimatedItemSize={177}
          onRefresh={manualRefresh}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator />
            ) : (
              <EmptyState
                preset="generic"
                style={$emptyState}
                headingTx={"cookbookListScreen.noFavoritesEmptyState.heading"}
                contentTx={"cookbookListScreen.noFavoritesEmptyState.content"}
                button={""}
                buttonOnPress={manualRefresh}
                imageStyle={$emptyStateImage}
                ImageProps={{ resizeMode: "contain" }}
              />
            )
          }
          ListHeaderComponent={
            <View>
              <View style={$headerContainer}>
                <Text preset="heading" tx="invitationListScreen.title" />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <InvitationCard
              invitation={item}
              onPressAccept={() => invitationStore.respond(item.id, true)}
              onPressReject={() => invitationStore.respond(item.id, true)}
            />
          )}
        />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ContentStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.lg,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}