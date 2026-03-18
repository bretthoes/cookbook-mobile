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

const tiktokLogo = require("@/assets/images/tiktok.png")
const instagramLogo = require("@/assets/images/instagram.png")
const pinterestLogo = require("@/assets/images/pinterest.png")

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
        <OptionListItem
          title={t("recipeAddOptionsScreen:optionFromVoice")}
          description={t("recipeAddOptionsScreen:optionFromVoiceDesc")}
          leftIcon="menu"
          onPress={() => router.replace("../recipe/add-voice")}
        />
        <OptionListItem
          title={t("recipeAddOptionsScreen:optionFromTiktok")}
          description={t("recipeAddOptionsScreen:optionFromTiktokDesc")}
          leftImage={tiktokLogo}
          onPress={() =>
            router.replace({
              pathname: "../recipe/add-social-import",
              params: { platform: "tiktok" },
            })
          }
        />
        <OptionListItem
          title={t("recipeAddOptionsScreen:optionFromInstagram")}
          description={t("recipeAddOptionsScreen:optionFromInstagramDesc")}
          leftImage={instagramLogo}
          onPress={() =>
            router.replace({
              pathname: "../recipe/add-social-import",
              params: { platform: "instagram" },
            })
          }
        />
        <OptionListItem
          title={t("recipeAddOptionsScreen:optionFromPinterest")}
          description={t("recipeAddOptionsScreen:optionFromPinterestDesc")}
          leftImage={pinterestLogo}
          onPress={() =>
            router.replace({
              pathname: "../recipe/add-social-import",
              params: { platform: "pinterest" },
            })
          }
        />
      </View>
    </Screen>
  )
})
