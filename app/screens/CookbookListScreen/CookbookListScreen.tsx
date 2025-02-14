import { observer } from "mobx-react-lite"
import React, { FC, useEffect, useState } from "react"
import {
  ActivityIndicator,
  ImageStyle,
  TextStyle,
  View,
  ViewStyle,
  Image,
} from "react-native"
import { type ContentStyle } from "@shopify/flash-list"
import {
  EmptyState,
  ListItem,
  ListView,
  PaginationControls,
  Screen,
  Text,
  Toggle,
} from "../../components"
import { isRTL, translate } from "../../i18n"
import { useStores } from "../../models"
import { colors, spacing } from "../../theme"
import { delay } from "../../utils/delay"
import { Cookbook } from "app/models/Cookbook"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"
import { Drawer } from "react-native-drawer-layout"
import { DrawerIconButton } from "../DemoShowroomScreen/DrawerIconButton"
import { DemoTabScreenProps } from "app/navigators/DemoNavigator"
import { CookbookCard } from "./CookbookCard"

const logo = require("../../../assets/images/logo.png")

interface CookbookListScreenProps extends DemoTabScreenProps<"CookbookList"> {}

export const CookbookListScreen: FC<CookbookListScreenProps> = observer(function CookbookListScreen() {
  // Pull in one of our MST stores
  const {
    cookbookStore: { fetch, cookbooks, favorites, favoritesOnly, toggleFavorite, hasFavorite, setProp },
  } = useStores()
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const navigation = useNavigation<DemoTabScreenProps<"CookbookList">["navigation"]>()

  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await fetch(cookbooks.pageNumber)
      setIsLoading(false)
    })()
  }, [])

  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([fetch(), delay(750)])
    setRefreshing(false)
  }

  const handleAddCookbook = () => {
    navigation.navigate("AddCookbook")
    toggleDrawer()
  }

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const handleNextPage = async () => {
    if (cookbooks.hasNextPage) {
      setIsLoading(true)
      await fetch(cookbooks.pageNumber + 1)
      setIsLoading(false)
    }
  }

  const handlePreviousPage = async () => {
    if (cookbooks.hasPreviousPage) {
      setIsLoading(true)
      await fetch(cookbooks.pageNumber - 1)
      setIsLoading(false)
    }
  }

  const $drawerInsets = useSafeAreaInsetsStyle(["top"])
  return (
    <Drawer
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      drawerType="back"
      drawerPosition={"right"}
      renderDrawerContent={() => (
        <View style={[$drawer, $drawerInsets]}>
          <View style={$logoContainer}>
            <Image source={logo} style={$logoImage} />
          </View>
          <ListItem
            text={translate("cookbookListScreen.add")}
            textStyle={$right}
            rightIcon="caretRight"
            onPress={handleAddCookbook}
          />
        </View>
      )}
    >
      <Screen
        preset="scroll"
        safeAreaEdges={["top"]}
        style={$root}
      >
        <ListView<Cookbook>
          contentContainerStyle={$listContentContainer}
          data={cookbooks.items.slice()}
          extraData={favorites.length ?? 0 + cookbooks.items.length ?? 0}
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
                headingTx={
                  favoritesOnly
                    ? "cookbookListScreen.noFavoritesEmptyState.heading"
                    : undefined
                }
                contentTx={
                  favoritesOnly
                    ? "cookbookListScreen.noFavoritesEmptyState.content"
                    : undefined
                }
                button={favoritesOnly ? "" : undefined}
                buttonOnPress={manualRefresh}
                imageStyle={$emptyStateImage}
                ImageProps={{ resizeMode: "contain" }}
              />
            )
          }
          ListHeaderComponent={
            <View>
              <View style={$headerContainer}>
                <Text preset="heading" tx="cookbookListScreen.title" />
                <DrawerIconButton onPress={toggleDrawer} />
              </View>
              {(favoritesOnly || cookbooks.items.length > 0) && (
                <View style={$toggle}>
                  <Toggle
                    value={favoritesOnly}
                    onValueChange={() =>
                      setProp("favoritesOnly", !favoritesOnly)
                    }
                    variant="switch"
                    labelTx="cookbookListScreen.onlyFavorites"
                    labelPosition="left"
                    labelStyle={$labelStyle}
                    accessibilityLabel={translate("cookbookListScreen.accessibility.switch")}
                  />
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <CookbookCard
              cookbook={item}
              isFavorite={hasFavorite(item)}
              onPressFavorite={() => toggleFavorite(item)}
            />
          )}
        />
        {cookbooks.hasMultiplePages && (
          <PaginationControls
            currentPage={cookbooks.pageNumber}
            totalPages={cookbooks.totalPages}
            totalCount={cookbooks.totalCount}
            hasNextPage={cookbooks.hasNextPage}
            hasPreviousPage={cookbooks.hasPreviousPage}
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
          />
        )}
      </Screen>
    </Drawer>
  )
},
)

// #region Styles
const $root: ViewStyle = {
  flex: 1,
}

const $listContentContainer: ContentStyle = {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.xl,
  paddingBottom: spacing.lg,
}

const $toggle: ViewStyle = {
  marginTop: spacing.md,
}

const $labelStyle: TextStyle = {
  textAlign: "left",
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
}

const $right: TextStyle = {
  textAlign: "right",
}

const $drawer: ViewStyle = {
  backgroundColor: colors.background,
  flex: 1,
}

const $logoImage: ImageStyle = {
  height: 42,
  width: 77,
}

const $logoContainer: ViewStyle = {
  alignSelf: "flex-end",
  justifyContent: "center",
  height: 56,
  paddingHorizontal: spacing.lg,
}
// #endregion
