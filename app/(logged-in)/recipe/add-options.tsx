import { OptionListItem, $container, $listContainer } from "@/components/OptionList"
import { Screen } from "@/components/Screen"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { View } from "react-native"

const link = require("../../../assets/images/link.png")
const camera = require("../../../assets/images/camera.png")

export default observer(function AddRecipeOptionsScreen() {
  const { themed } = useAppTheme()

  useHeader({
    leftIcon: "back",
    title: "Add Recipe",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <OptionListItem
          title="Add Recipe Manually"
          description="Create a new recipe from scratch"
          leftIcon="create"
          onPress={() => router.replace("../recipe/add")}
        />
        <OptionListItem
          title="Add Recipe from URL"
          description="Import a recipe from a website"
          leftImage={link}
          onPress={() => router.replace("../recipe/select-url")}
        />
        <OptionListItem
          title="Add Recipe from Photo"
          description="Import a recipe from a photo"
          leftImage={camera}
          onPress={() =>
            router.replace({
              pathname: "../select-cookbook",
              params: {
                nextRoute: "/(logged-in)/(tabs)/recipe/add",
                action: "Select a cookbook to add the recipe to.",
                onSelect: "handleAddRecipeFromCamera",
              },
            })
          }
        />
      </View>
    </Screen>
  )
})
