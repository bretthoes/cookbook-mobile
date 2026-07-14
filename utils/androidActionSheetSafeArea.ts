import type { ViewStyle } from "react-native"

/**
 * Builds containerStyle so the Android action sheet clears the system navigation
 * bar (3-button or gesture) when edge-to-edge drawing is enabled.
 *
 * On iOS this is unused — the native action sheet already respects safe area.
 */
export function androidActionSheetContainerStyle(
  bottomInset: number,
  existing?: ViewStyle,
): ViewStyle | undefined {
  if (bottomInset <= 0) return existing

  const existingPadding =
    typeof existing?.paddingBottom === "number" ? existing.paddingBottom : 0

  return {
    ...existing,
    paddingBottom: existingPadding + bottomInset,
  }
}
