import {
  useActionSheet as useExpoActionSheet,
  type ActionSheetProps,
} from "@expo/react-native-action-sheet"
import { useCallback } from "react"
import { Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { androidActionSheetContainerStyle } from "@/utils/androidActionSheetSafeArea"

/**
 * App action sheet wrapper. On Android (edge-to-edge), pads the sheet so it does
 * not overlap the system navigation buttons. iOS uses the native sheet unchanged.
 */
export function useActionSheet(): ActionSheetProps {
  const { showActionSheetWithOptions: show } = useExpoActionSheet()
  const { bottom } = useSafeAreaInsets()

  const showActionSheetWithOptions = useCallback<ActionSheetProps["showActionSheetWithOptions"]>(
    (options, callback) => {
      if (Platform.OS !== "android") {
        show(options, callback)
        return
      }

      show(
        {
          ...options,
          containerStyle: androidActionSheetContainerStyle(bottom, options.containerStyle),
        },
        callback,
      )
    },
    [bottom, show],
  )

  return { showActionSheetWithOptions }
}
