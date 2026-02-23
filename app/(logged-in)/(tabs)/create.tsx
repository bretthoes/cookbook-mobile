import { OptionListItem, $listContainer } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { TextStyle, View } from "react-native"

const cookbook = require("../../../assets/images/cookbook.png")
const addRecipe = require("../../../assets/images/addRecipe.png")
const invite = require("../../../assets/images/invite.png")

export default observer(function CreateScreen() {
  const { themed } = useAppTheme()

  const $themedTitle = useMemo(() => themed($title), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]}>
      <Text preset="heading" tx="createScreen:title" style={$themedTitle} />

      <View style={$themedListContainer}>
        <OptionListItem
          title="A New Cookbook"
          description="Create a new collection and fill it with your favorite recipes"
          leftImage={cookbook}
          onPress={() => router.push("../cookbook/add")}
        />
        <OptionListItem
          title="A New Recipe"
          description="Add a recipe to one of your cookbooks"
          leftImage={addRecipe}
          onPress={() =>
            router.push({
              pathname: "../select-cookbook",
              params: {
                nextRoute: "../../recipe/add-options",
                action: "Select the cookbook where you would like to add a new recipe.",
              },
            } as any)
          }
        />
        <OptionListItem
          title="Invitation to a Friend"
          description="Send a link to your friend"
          leftImage={invite}
          onPress={() =>
            router.push({
              pathname: "../select-cookbook",
              params: {
                nextRoute: "../invitation/add-options",
                action:
                  "Select the cookbook where you would like to send an invitation to a friend.",
              },
            } as any)
          }
        />
      </View>
    </Screen>
  )
})

const $title: ThemedStyle<TextStyle> = (theme) => ({
  marginBottom: theme.spacing.lg,
  paddingHorizontal: theme.spacing.lg,
  paddingTop: theme.spacing.lg + theme.spacing.xl,
})
