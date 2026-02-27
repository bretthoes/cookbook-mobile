import { $container, $listContainer, OptionListItem } from "@/components/OptionListItem"
import { Screen } from "@/components/Screen"
import { useAddRecipeFromCamera } from "@/hooks/useAddRecipeFromCamera"
import { useStores } from "@/models/helpers/useStores"
import { useAppTheme } from "@/theme/context"
import { useHeader } from "@/utils/useHeader"
import { router } from "expo-router"
import { observer } from "mobx-react-lite"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { View } from "react-native"

export default observer(function AddRecipeOptionsScreen() {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
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
          title={t("recipeAddOptionsScreen:optionManual")}
          description={t("recipeAddOptionsScreen:optionManualDesc")}
          leftIcon="pen"
          onPress={() => router.replace("../recipe/add")}
        />
        <OptionListItem
          title={t("recipeAddOptionsScreen:optionFromUrl")}
          description={t("recipeAddOptionsScreen:optionFromUrlDesc")}
          leftIcon="web"
          onPress={() => router.replace("../recipe/select-url")}
        />
        <OptionListItem
          title={t("recipeAddOptionsScreen:optionFromPhoto")}
          description={t("recipeAddOptionsScreen:optionFromPhotoDesc")}
          leftIcon="camera"
          onPress={() => {
            if (cookbookStore.selected) {
              addRecipeFromCamera()
            } else {
              router.replace({
                pathname: "../select-cookbook",
                params: {
                  nextRoute: "/(logged-in)/(tabs)/recipe/add",
                  action: t("selectCookbookScreen:actionForAddFromCamera"),
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
