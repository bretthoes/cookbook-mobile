import { OptionListItem, $container, $listContainer } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { useAddRecipeFromCamera } from "@/hooks/useAddRecipeFromCamera"
import { translate } from "@/i18n"
import { useStores } from "@/models/helpers/useStores"
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
  const { cookbookStore } = useStores()
  const addRecipeFromCamera = useAddRecipeFromCamera()

  useHeader({
    leftIcon: "back",
    titleTx: "recipeAddOptionsScreen:title",
    onLeftPress: () => router.back(),
  })

  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedListContainer = useMemo(() => themed($listContainer), [themed])

  return (
    <Screen preset="scroll" safeAreaEdges={["top"]} contentContainerStyle={$themedContainer}>
      <View style={$themedListContainer}>
        <OptionListItem
          title={translate("recipeAddOptionsScreen:optionManual")}
          description={translate("recipeAddOptionsScreen:optionManualDesc")}
          leftIcon="create"
          onPress={() => router.replace("../recipe/add")}
        />
        <OptionListItem
          title={translate("recipeAddOptionsScreen:optionFromUrl")}
          description={translate("recipeAddOptionsScreen:optionFromUrlDesc")}
          leftImage={link}
          onPress={() => router.replace("../recipe/select-url")}
        />
        <OptionListItem
          title={translate("recipeAddOptionsScreen:optionFromPhoto")}
          description={translate("recipeAddOptionsScreen:optionFromPhotoDesc")}
          leftImage={camera}
          onPress={() => {
            if (cookbookStore.selected) {
              addRecipeFromCamera()
            } else {
              router.replace({
                pathname: "../select-cookbook",
                params: {
                  nextRoute: "/(logged-in)/(tabs)/recipe/add",
                  action: translate("selectCookbookScreen:actionForAddFromCamera"),
                  onSelect: "handleAddRecipeFromCamera",
                },
              })
            }
          }}
        />
      </View>
    </Screen>
  )
})
