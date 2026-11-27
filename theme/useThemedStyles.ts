import { useMemo } from "react"

import { useAppTheme } from "@/theme/context"
import type { AllowedStylesT } from "@/theme/types"

/** Resolve one stable `ThemedStyle` for the active theme. */
export function useThemedStyles<T>(style: AllowedStylesT<T>): T {
  const { themed } = useAppTheme()
  return useMemo(() => themed(style), [themed, style])
}
