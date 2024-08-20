import React, { FC, useEffect } from "react"
import { useStores } from "../models"
import { DemoTabScreenProps } from "../navigators/DemoNavigator"
import { delay } from "../utils/delay"
import { observer } from "mobx-react-lite"
import { Screen } from "../components"

export const CookbookDetailScreen: FC<DemoTabScreenProps<"CookbookDetail">> = observer(
  function CookbookDetailScreen(_props) {
    const { recipeStore } = useStores()

    const [refreshing, setRefreshing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    // initially, kick off a background refresh without the refreshing UI
    useEffect(() => {
      ;(async function load() {
        setIsLoading(true)
        await recipeStore.fetchRecipes(_props.route.params.cookbookId)
        setIsLoading(false)
      })()
    }, [recipeStore])

    // simulate a longer refresh, if the refresh is too fast for UX
    async function manualRefresh() {
      setRefreshing(true)
      await Promise.all([recipeStore.fetchRecipes(_props.route.params.cookbookId), delay(750)])
      setRefreshing(false)
    }

    return (
      <Screen
        preset="fixed"
        safeAreaEdges={["top"]}
      >
      </Screen>
    )
  },
)
