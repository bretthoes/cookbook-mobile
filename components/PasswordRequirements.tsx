import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { translate } from "@/i18n"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme"
import { useMemo } from "react"
import { View, ViewStyle, TextStyle } from "react-native"

const REQUIREMENTS = [
  { key: "minLength" as const, test: (p: string) => p.length >= 6 },
  { key: "maxLength" as const, test: (p: string) => p.length <= 30 },
  { key: "needsUppercase" as const, test: (p: string) => /[A-Z]/.test(p) },
  { key: "needsLowercase" as const, test: (p: string) => /[a-z]/.test(p) },
  { key: "needsDigit" as const, test: (p: string) => /\d/.test(p) },
  { key: "needsSpecialChar" as const, test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const

export interface PasswordRequirementsProps {
  password: string
}

/**
 * Real-time password requirement checklist. Shows checkmarks as requirements are met.
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { themed, theme } = useAppTheme()
  const $themedContainer = useMemo(() => themed($container), [themed])
  const $themedRow = useMemo(() => themed($row), [themed])
  const $themedLabel = useMemo(() => themed($labelText), [themed])

  return (
    <View
      style={$themedContainer}
      accessibilityRole="list"
      accessibilityLabel="Password requirements"
    >
      {REQUIREMENTS.map(({ key, test }) => {
        const met = test(password)
        return (
          <View
            key={key}
            style={$themedRow}
            accessibilityState={{ checked: met }}
            accessibilityLabel={translate(`registerScreen:validation.${key}`)}
          >
            {met ? (
              <Icon
                icon="check"
                color={theme.colors.tint}
                size={16}
              />
            ) : (
              <View style={[$circle, { borderColor: theme.colors.border }]} />
            )}
            <Text
              tx={`registerScreen:validation.${key}`}
              preset="formHelper"
              style={[$themedLabel, met && $metLabel]}
            />
          </View>
        )
      })}
    </View>
  )
}

// #region Styles
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  marginTop: theme.spacing.xs,
  gap: theme.spacing.xs,
})

const $row: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing.sm,
})

const $labelText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
  flex: 1,
})

const $metLabel: TextStyle = {
  opacity: 0.8,
}

const $circle: ViewStyle = {
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 1.5,
}
// #endregion
