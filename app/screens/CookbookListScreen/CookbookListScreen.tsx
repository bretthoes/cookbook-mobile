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
  const { cookbookStore } = useStores()
  const [open, setOpen] = useState(false)
  const [refreshing, setRefreshing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const navigation = useNavigation<DemoTabScreenProps<"CookbookList">["navigation"]>()
  // initially, kick off a background refresh without the refreshing UI
  useEffect(() => {
    ;(async function load() {
      setIsLoading(true)
      await cookbookStore.fetchCookbooks()
      setIsLoading(false)
    })()
  }, [cookbookStore])

  // simulate a longer refresh, if the refresh is too fast for UX
  async function manualRefresh() {
    setRefreshing(true)
    await Promise.all([cookbookStore.fetchCookbooks(), delay(750)])
    setRefreshing(false)
  }

  const handleAddCookbook = () => {
    navigation.navigate("AddCookbook")
    toggleDrawer()
  }

  const toggleDrawer = () => {
    setOpen(!open)
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
        preset="fixed"
        safeAreaEdges={["top"]}
        contentContainerStyle={$root}
      >
        <ListView<Cookbook>
          contentContainerStyle={$listContentContainer}
          data={cookbookStore.cookbooksForList.slice()}
          extraData={cookbookStore.favorites.length ?? 0 + cookbookStore.cookbooks.items.length ?? 0}
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
                  cookbookStore.favoritesOnly
                    ? "cookbookListScreen.noFavoritesEmptyState.heading"
                    : undefined
                }
                contentTx={
                  cookbookStore.favoritesOnly
                    ? "cookbookListScreen.noFavoritesEmptyState.content"
                    : undefined
                }
                button={cookbookStore.favoritesOnly ? "" : undefined}
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
              {(cookbookStore.favoritesOnly || cookbookStore.cookbooksForList.length > 0) && (
                <View style={$toggle}>
                  <Toggle
                    value={cookbookStore.favoritesOnly}
                    onValueChange={() =>
                      cookbookStore.setProp("favoritesOnly", !cookbookStore.favoritesOnly)
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
              isFavorite={cookbookStore.hasFavorite(item)}
              onPressFavorite={() => cookbookStore.toggleFavorite(item)}
            />
          )}
        />
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
