import React, { FC, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, ImageStyle, View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { EmptyState, ListView, PaginationControls, Screen, Text } from "app/components"
import { Invitation, useStores } from "app/models"
import { delay } from "app/utils/delay"
import { spacing } from "app/theme"
import { ContentStyle } from "@shopify/flash-list"
import { isRTL } from "app/i18n"
import { InvitationCard } from "../components/InvitationCard"

interface InvitationsListScreenProps extends AppStackScreenProps<"InvitationsList"> {}

export const InvitationsListScreen: FC<InvitationsListScreenProps> = observer(function InvitationsListScreen() {
   const {
    invitationStore: { respond, fetch, invitations },
  } = useStores()
   const [refreshing, setRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

   useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await fetch(invitations.pageNumber)
      setIsLoading(false)
    })()
  }, [])

  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([fetch(invitations.pageNumber), delay(750)])
    setRefreshing(false)
  }

  const handleNextPage = async () => {
    if (invitations.hasNextPage) {
      setIsLoading(true)
      await fetch(invitations.pageNumber + 1)
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (invitations.hasPreviousPage) {
      setIsLoading(true)
      await fetch(invitations.pageNumber - 1)
      setIsLoading(false)
    }
  }

  return (
    <Screen
      style={$root}
      preset="scroll"
      safeAreaEdges={["top"]}>
      <ListView<Invitation>
          contentContainerStyle={$listContentContainer}
          data={invitations.items.slice()}
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
              onPressAccept={() => respond(item.id, true)}
              onPressReject={() => respond(item.id, false)}
            />
          )}
        />
        {invitations.hasMultiplePages && (
          <PaginationControls
            currentPage={invitations.pageNumber}
            totalPages={invitations.totalPages}
            totalCount={invitations.totalCount}
            hasNextPage={invitations.hasNextPage}
            hasPreviousPage={invitations.hasPreviousPage}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        )}
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