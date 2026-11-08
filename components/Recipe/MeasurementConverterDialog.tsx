import { Button } from "@/components/Button"
import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import type { TxKeyPath } from "@/i18n"
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import {
  convertMeasurement,
  formatMeasurementAmount,
  parseMeasurementAmount,
  VOLUME_UNITS,
  WEIGHT_UNITS,
  type MeasurementFamily,
  type MeasurementUnit,
} from "@/utils/measurementConvert"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Keyboard,
  type KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextStyle,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const UNIT_ONE: Record<MeasurementUnit, TxKeyPath> = {
  tsp: "measurementConverter:unit.tsp",
  tbsp: "measurementConverter:unit.tbsp",
  flOz: "measurementConverter:unit.flOz",
  stick: "measurementConverter:unit.stick",
  cup: "measurementConverter:unit.cup",
  pint: "measurementConverter:unit.pint",
  quart: "measurementConverter:unit.quart",
  ml: "measurementConverter:unit.ml",
  l: "measurementConverter:unit.l",
  oz: "measurementConverter:unit.oz",
  lb: "measurementConverter:unit.lb",
  g: "measurementConverter:unit.g",
  kg: "measurementConverter:unit.kg",
}

const UNIT_OTHER: Record<MeasurementUnit, TxKeyPath> = {
  tsp: "measurementConverter:unit.tsp_plural",
  tbsp: "measurementConverter:unit.tbsp_plural",
  flOz: "measurementConverter:unit.flOz_plural",
  stick: "measurementConverter:unit.stick_plural",
  cup: "measurementConverter:unit.cup_plural",
  pint: "measurementConverter:unit.pint_plural",
  quart: "measurementConverter:unit.quart_plural",
  ml: "measurementConverter:unit.ml_plural",
  l: "measurementConverter:unit.l_plural",
  oz: "measurementConverter:unit.oz_plural",
  lb: "measurementConverter:unit.lb_plural",
  g: "measurementConverter:unit.g_plural",
  kg: "measurementConverter:unit.kg_plural",
}

export interface MeasurementConverterDialogProps {
  visible: boolean
  onDismiss: () => void
}

export function MeasurementConverterDialog({
  visible,
  onDismiss,
}: MeasurementConverterDialogProps) {
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { height: windowHeight } = useWindowDimensions()
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [family, setFamily] = useState<MeasurementFamily>("volume")
  const [amountText, setAmountText] = useState("")
  const [fromUnit, setFromUnit] = useState<MeasurementUnit>("tbsp")
  const [toUnit, setToUnit] = useState<MeasurementUnit>("cup")

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0)
      return
    }

    const onFrame = (event: KeyboardEvent) => {
      const overlap =
        Platform.OS === "ios"
          ? windowHeight - event.endCoordinates.screenY
          : event.endCoordinates.height
      setKeyboardHeight(Math.max(0, overlap))
    }
    const showEvent = Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow"
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide"
    const showSub = Keyboard.addListener(showEvent, onFrame)
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0))
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [visible, windowHeight])

  const units = family === "volume" ? VOLUME_UNITS : WEIGHT_UNITS
  const parsedAmount = parseMeasurementAmount(amountText)
  const showInvalid = amountText.trim().length > 0 && parsedAmount == null
  const converted = parsedAmount == null ? null : convertMeasurement(parsedAmount, fromUnit, toUnit)
  const formatted = converted == null ? "" : formatMeasurementAmount(converted)
  const useSingularUnit =
    formatted === "1" || (converted != null && converted > 0 && converted <= 1)
  const resultUnit = useSingularUnit ? UNIT_ONE[toUnit] : UNIT_OTHER[toUnit]

  const keyboardLift = keyboardHeight > 0 ? keyboardHeight : insets.bottom
  const maxDialogHeight = Math.max(220, windowHeight - keyboardLift - insets.top - theme.spacing.lg)

  const $themedOverlay = useMemo(() => themed($overlay), [themed])
  const $themedDialog = useMemo(() => themed($dialog), [themed])
  const $themedDialogContent = useMemo(() => themed($dialogContent), [themed])
  const $themedTitle = useMemo(() => themed($title), [themed])
  const $themedFamilyRow = useMemo(() => themed($familyRow), [themed])
  const $themedAmountInput = useMemo(() => themed($amountInput), [themed])
  const $themedFieldGroup = useMemo(() => themed($fieldGroup), [themed])
  const $themedChipRow = useMemo(() => themed($chipRow), [themed])
  const $themedSwapButton = useMemo(() => themed($swapButton), [themed])
  const $themedResultBox = useMemo(() => themed($resultBox), [themed])
  const $themedEmptyResult = useMemo(() => themed($emptyResult), [themed])

  const dismiss = () => {
    Keyboard.dismiss()
    onDismiss()
  }

  const selectFamily = (next: MeasurementFamily) => {
    if (next === family) return
    setFamily(next)
    if (next === "volume") {
      setFromUnit("tbsp")
      setToUnit("cup")
    } else {
      setFromUnit("oz")
      setToUnit("g")
    }
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
      <Pressable style={$themedOverlay} onPress={dismiss}>
        <Pressable
          style={[
            $themedDialog,
            {
              marginBottom: keyboardLift + theme.spacing.md,
              maxHeight: maxDialogHeight,
            },
          ]}
          onPress={(event) => event.stopPropagation()}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            bounces={false}
            contentContainerStyle={$themedDialogContent}
            style={{ maxHeight: maxDialogHeight }}
          >
            <Text tx="measurementConverter:title" preset="subheading" style={$themedTitle} />

            <View style={$themedFamilyRow}>
              <FamilyButton
                tx="measurementConverter:volume"
                selected={family === "volume"}
                onPress={() => selectFamily("volume")}
              />
              <FamilyButton
                tx="measurementConverter:weight"
                selected={family === "weight"}
                onPress={() => selectFamily("weight")}
              />
            </View>

            <TextField
              labelTx="measurementConverter:amountLabel"
              placeholderTx="measurementConverter:amountPlaceholder"
              value={amountText}
              onChangeText={setAmountText}
              autoCapitalize="none"
              autoCorrect={false}
              status={showInvalid ? "error" : undefined}
              helperTx={showInvalid ? "measurementConverter:invalidAmount" : undefined}
              inputWrapperStyle={$themedAmountInput}
            />

            <View style={$themedFieldGroup}>
              <Text tx="measurementConverter:fromLabel" preset="formLabel" />
              <View style={$themedChipRow}>
                {units.map((unit) => (
                  <UnitChip
                    key={`from-${unit}`}
                    unit={unit}
                    selected={fromUnit === unit}
                    onPress={setFromUnit}
                  />
                ))}
              </View>
            </View>

            <PressableIcon
              icon="convert"
              size={18}
              onPress={swapUnits}
              accessibilityRole="button"
              accessibilityLabel={t("measurementConverter:swapA11y")}
              containerStyle={$themedSwapButton}
            />

            <View style={$themedFieldGroup}>
              <Text tx="measurementConverter:toLabel" preset="formLabel" />
              <View style={$themedChipRow}>
                {units.map((unit) => (
                  <UnitChip
                    key={`to-${unit}`}
                    unit={unit}
                    selected={toUnit === unit}
                    onPress={setToUnit}
                  />
                ))}
              </View>
            </View>

            <View style={$themedFieldGroup}>
              <Text tx="measurementConverter:resultLabel" preset="formLabel" />
              <View style={$themedResultBox}>
                {formatted.length > 0 ? (
                  <Text
                    tx="measurementConverter:resultValue"
                    txOptions={{ amount: formatted, unit: t(resultUnit) }}
                    size="lg"
                  />
                ) : (
                  <Text
                    tx="measurementConverter:emptyResult"
                    size="lg"
                    style={$themedEmptyResult}
                  />
                )}
              </View>
            </View>

            <Button tx="measurementConverter:close" preset="reversed" onPress={dismiss} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function FamilyButton({
  tx,
  selected,
  onPress,
}: {
  tx: TxKeyPath
  selected: boolean
  onPress: () => void
}) {
  const { themed } = useAppTheme()
  const { t } = useTranslation()
  const $themedButton = useMemo(
    () => themed([$familyButton, selected && $choiceSelected]),
    [selected, themed],
  )
  const $themedLabel = useMemo(
    () => (selected ? themed($choiceSelectedText) : undefined),
    [selected, themed],
  )

  return (
    <Pressable
      onPress={onPress}
      style={$themedButton}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={t(tx)}
    >
      <Text tx={tx} size="sm" style={$themedLabel} />
    </Pressable>
  )
}

function UnitChip({
  unit,
  selected,
  onPress,
}: {
  unit: MeasurementUnit
  selected: boolean
  onPress: (unit: MeasurementUnit) => void
}) {
  const { themed, theme } = useAppTheme()
  const { t } = useTranslation()
  const label = t(UNIT_ONE[unit])
  const $themedChip = useMemo(
    () => themed([$unitChip, selected && $choiceSelected]),
    [selected, themed],
  )
  const $themedLabel = useMemo(
    () => (selected ? themed($choiceSelectedText) : undefined),
    [selected, themed],
  )

  return (
    <Pressable
      onPress={() => onPress(unit)}
      style={$themedChip}
      hitSlop={theme.spacing.xxs}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text tx={UNIT_ONE[unit]} size="xs" style={$themedLabel} />
    </Pressable>
  )
}

// #region Styles
const $overlay: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  backgroundColor: theme.colors.palette.overlay50,
  justifyContent: "flex-end",
  paddingHorizontal: theme.spacing.md,
})

const $dialog: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  borderRadius: theme.spacing.md,
  overflow: "hidden",
})

const $dialogContent: ThemedStyle<ViewStyle> = (theme) => ({
  paddingHorizontal: theme.spacing.md,
  paddingVertical: theme.spacing.sm,
  gap: theme.spacing.xs,
})

const $title: ThemedStyle<TextStyle> = () => ({
  textAlign: "center",
})

const $amountInput: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
})

const $fieldGroup: ThemedStyle<ViewStyle> = (theme) => ({
  gap: theme.spacing.xxs,
})

const $familyRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  gap: theme.spacing.xs,
})

const $familyButton: ThemedStyle<ViewStyle> = (theme) => ({
  flex: 1,
  alignItems: "center",
  paddingVertical: theme.spacing.xs,
  borderRadius: theme.spacing.xs,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.backgroundDim,
})

const $chipRow: ThemedStyle<ViewStyle> = (theme) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: theme.spacing.xs,
})

const $unitChip: ThemedStyle<ViewStyle> = (theme) => ({
  paddingVertical: theme.spacing.xxs,
  paddingHorizontal: theme.spacing.xs,
  borderRadius: theme.spacing.xs,
  borderWidth: 1,
  borderColor: theme.colors.border,
  backgroundColor: theme.colors.backgroundDim,
})

const $choiceSelected: ThemedStyle<ViewStyle> = (theme) => ({
  borderColor: theme.colors.text,
  backgroundColor: theme.colors.text,
})

const $choiceSelectedText: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.background,
})

const $swapButton: ThemedStyle<ViewStyle> = (theme) => ({
  alignSelf: "center",
  width: theme.spacing.xl,
  height: theme.spacing.xl,
  borderRadius: theme.spacing.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.colors.backgroundDim,
  borderWidth: 1,
  borderColor: theme.colors.border,
})

const $resultBox: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.backgroundDim,
  borderRadius: theme.spacing.xs,
  paddingVertical: theme.spacing.xs,
  paddingHorizontal: theme.spacing.sm,
  alignItems: "center",
})

const $emptyResult: ThemedStyle<TextStyle> = (theme) => ({
  color: theme.colors.textDim,
})
// #endregion
