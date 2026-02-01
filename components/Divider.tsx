import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import React, { useMemo } from "react"
import { StyleProp, View, ViewStyle } from "react-native"

interface DividerProps {
  type?: "vertical" | "horizontal"
  size?: number
  style?: StyleProp<ViewStyle>
  line?: boolean
}

/**
 * @param {DividerProps} props - The props for the `Divider` component.
 * @returns {JSX.Element} The rendered `Divider` component.
 */
export function Divider(props: DividerProps) {
  const { type = "horizontal", size = 10, line = false, style: $styleOverride } = props
  const { themed } = useAppTheme()

  const $themedDivider = useMemo(() => themed($divider), [themed])
  const $themedLine = useMemo(() => themed($line), [themed])

  return (
    <View
      style={[
        $themedDivider,
        type === "horizontal" && { height: size },
        type === "vertical" && { width: size },
        $styleOverride,
      ]}
    >
      {line && (
        <View
          style={[
            $themedLine,
            type === "horizontal" && {
              width: 150,
              height: 1,
              marginStart: -75,
              marginTop: -1,
            },
            type === "vertical" && {
              height: 50,
              width: 1,
              marginTop: -25,
              marginStart: -1,
            },
          ]}
        />
      )}
    </View>
  )
}

const $divider: ThemedStyle<ViewStyle> = () => ({
  flexGrow: 0,
  flexShrink: 0,
})

const $line: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.border,
  position: "absolute",
  left: "50%",
  top: "50%",
})
