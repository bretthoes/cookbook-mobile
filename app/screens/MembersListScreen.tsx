import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { ActivityIndicator, ImageStyle, View, ViewStyle } from "react-native"
import { AppStackScreenProps } from "app/navigators"
import { Button, EmptyState, ListItem, ListView, PaginationControls, Screen, SearchBar, Text } from "app/components"
import { useStores } from "app/models"
import { delay } from "app/utils/delay"
import { Membership } from "app/models/Membership"
import { colors, spacing } from "app/theme"
import { isRTL } from "app/i18n"
import { DemoDivider } from "./DemoShowroomScreen/DemoDivider"
import { useNavigation } from "@react-navigation/native"

interface MembersListScreenProps extends AppStackScreenProps<"MembersList"> {}

export const MembersListScreen: FC<MembersListScreenProps> = observer(function MembersListScreen() {
  const { membershipStore, cookbookStore } = useStores()
  const [refreshing, setRefreshing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const filteredMemberships =
    membershipStore.memberships?.items
      .slice()
      .filter((membership) => membership.name.toLowerCase().includes(searchQuery.toLowerCase())) ?? []

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

  const handlePressItem = async () => {
    // TODO set current membership, navigate to membership details screen
    //navigation.navigate("MembershipDetails")
  }
  
  const navigation = useNavigation<AppStackScreenProps<"MembersList">["navigation"]>()
  const handleInvite = () => {
    navigation.navigate("AddInvite")
  }

  return (
    <Screen style={$root} safeAreaEdges={["top"]} preset="scroll">
      <ListView<Membership>
        data={filteredMemberships}        
        estimatedItemSize={59}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator />
          ) : (
            <EmptyState
              preset="generic"
              style={$emptyState}
              buttonOnPress={manualRefresh}
              imageStyle={$emptyStateImage}
              ImageProps={{ resizeMode: "contain" }}
            />
          )
        }
        ListHeaderComponent={
          <View>
            <View style={$headerContainer}>
              <Text preset="heading" text={`Members of ${cookbookStore.currentCookbook?.title ?? "the cookbook"}`} />
            </View>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {membershipStore.memberships?.hasMultiplePages ? (
              <PaginationControls
                currentPage={membershipStore.memberships?.pageNumber}
                totalPages={membershipStore.memberships?.totalPages}
                totalCount={membershipStore.memberships?.totalCount}
                hasNextPage={membershipStore.memberships?.hasNextPage}
                hasPreviousPage={membershipStore.memberships?.hasPreviousPage}
                onNextPage={handleNextPage}
                onPreviousPage={handlePreviousPage}
              />
            ) : (
              <DemoDivider size={spacing.sm} />
            )}
          </View>
        }
        onRefresh={manualRefresh}
        refreshing={refreshing}
        renderItem={({item, index}) => (
          <View
              style={[
                $listItemStyle,
                index === 0 && $borderTop,
                index === filteredMemberships.length - 1 && $borderBottom,
              ]}
            >
              <ListItem
                onPress={handlePressItem}
                text={item.name}
                rightIcon="caretRight"
                TextProps={{ numberOfLines: 1, size: "xs" }}
                topSeparator
              />
            </View>
        )}
      />
      <DemoDivider size={spacing.sm} />
      <Button text="Add new member" onPress={handleInvite} />
    </Screen>
  )
})

const $root: ViewStyle = {
  flex: 1,
}

const $listItemStyle: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  marginHorizontal: spacing.lg,
}

const $borderTop: ViewStyle = {
  borderTopLeftRadius: spacing.xs,
  borderTopRightRadius: spacing.xs,
  paddingTop: spacing.lg,
}

const $borderBottom: ViewStyle = {
  borderBottomLeftRadius: spacing.xs,
  borderBottomRightRadius: spacing.xs,
  paddingBottom: spacing.lg,
}

const $emptyState: ViewStyle = {
  marginTop: spacing.xxl,
}

const $emptyStateImage: ImageStyle = {
  transform: [{ scaleX: isRTL ? -1 : 1 }],
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: spacing.xl,
  paddingHorizontal: spacing.md,
}