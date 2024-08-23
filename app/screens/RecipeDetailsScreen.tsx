import React, { FC, useEffect, useState } from "react"
import { useStores } from "../models"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { observer } from "mobx-react-lite"
import { Screen } from "../components"
import { ImageStyle, View, ViewStyle } from "react-native"
import { colors, spacing } from "app/theme"
import { Drawer } from "react-native-drawer-layout"
import { Image } from "react-native"
import { useSafeAreaInsetsStyle } from "app/utils/useSafeAreaInsetsStyle"

const logo = require("../../assets/images/logo.png")


export const RecipeDetailsScreen: FC<DemoTabScreenProps<"RecipeDetails">> = observer(
  function RecipeListScreen(_props) {
    console.debug("recipeId=" + _props.route.params.recipeId)
    const { recipeStore } = useStores()
    const [open, setOpen] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    // initially, kick off a background refresh without the refreshing UI
    useEffect(() => {
      ;(async function load() {
        setIsLoading(true)
        //await recipeStore.fetchRecipes(_props.route.params.cookbookId)
        setIsLoading(false)
      })()
    }, [recipeStore])

    // simulate a longer refresh, if the refresh is too fast for UX
    async function manualRefresh() {
      setRefreshing(true)
      //await Promise.all([recipeStore.fetchRecipes(_props.route.params.cookbookId), delay(750)])
      setRefreshing(false)
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
          </View>
        )}
      >
        <Screen
          preset="fixed"
          safeAreaEdges={["top"]}
          contentContainerStyle={$screenContentContainer}
        >
        </Screen>
      </Drawer>
    )
  },
)

// #region Styles

const $screenContentContainer: ViewStyle = {
  flex: 1,
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
