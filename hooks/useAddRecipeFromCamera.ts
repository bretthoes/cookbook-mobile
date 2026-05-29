import { useStores } from "@/models/helpers/useStores"
import { translate } from "@/i18n"
import { useActionSheet } from "@expo/react-native-action-sheet"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { useCallback } from "react"

/**
 * Hook that launches the add-recipe-from-photo flow: action sheet (take photo / select from roll),
 * image extraction via API, then navigation to recipe add screen.
 * Requires cookbookStore.selected to be set (cookbook must already be selected).
 */
export function useAddRecipeFromCamera() {
  const { recipeStore } = useStores()
  const { showActionSheetWithOptions } = useActionSheet()

  const processPickedAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      const importResult = await recipeStore.importFromImage(asset)
      if (importResult.ok) {
        router.replace("/(logged-in)/recipe/add")
      } else {
        alert(translate("selectCookbookScreen:imageParsingFailed"))
      }
    },
    [recipeStore],
  )

  return useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      alert(translate("selectCookbookScreen:allowCameraRollAccess"))
      return
    }

    const options = [
      translate("selectCookbookScreen:takePhoto"),
      translate("selectCookbookScreen:selectFromRoll"),
      translate("common:cancel"),
    ]
    const cancelButtonIndex = options.length - 1

    showActionSheetWithOptions({ options, cancelButtonIndex }, async (buttonIndex) => {
      if (buttonIndex === 0) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          mediaTypes: ["images"],
        })
        if (!result.canceled && result.assets?.length) {
          await processPickedAsset(result.assets[0])
        }
      } else if (buttonIndex === 1) {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: false,
          allowsEditing: true,
        })
        if (!result.canceled && result.assets?.length) {
          await processPickedAsset(result.assets[0])
        }
      }
    })
  }, [showActionSheetWithOptions, processPickedAsset])
}
