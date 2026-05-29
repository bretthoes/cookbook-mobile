import { Button } from "@/components/Button"
import { Divider } from "@/components/Divider"
import { PressableIcon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { TextField } from "@/components/TextField"
import { spacing } from "@/theme"
import { MAX_INGREDIENTS_TOTAL } from "@/utils/recipeIngredientSections"
import { Control, Controller, FieldErrors, useFieldArray } from "react-hook-form"
import { TextStyle, View, ViewStyle } from "react-native"
import type { RecipeFormInputs } from "./RecipeForm"

export type IngredientSectionEditorProps = {
  control: Control<RecipeFormInputs>
  sectionIndex: number
  errors: FieldErrors<RecipeFormInputs>
  themedDirectionItemContainer: ViewStyle
  themedDirectionIndex: TextStyle
  themedTextFieldContainer: ViewStyle
  themedButtonHeightOverride: ViewStyle
  errorTextStyle: TextStyle
  onRemoveSection: () => void
  canRemoveSection: boolean
  totalIngredientSlots: number
}

export function IngredientSectionEditor(props: IngredientSectionEditorProps) {
  const {
    control,
    sectionIndex,
    errors,
    themedDirectionItemContainer,
    themedDirectionIndex,
    themedTextFieldContainer,
    themedButtonHeightOverride,
    errorTextStyle,
    onRemoveSection,
    canRemoveSection,
    totalIngredientSlots,
  } = props

  const {
    fields: lineFields,
    append: appendLine,
    remove: removeLine,
  } = useFieldArray({
    control,
    name: `ingredientSections.${sectionIndex}.ingredients`,
  })

  return (
    <View style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name={`ingredientSections.${sectionIndex}.title`}
            render={({ field }) => (
              <TextField
                value={field.value}
                onChangeText={field.onChange}
                placeholderTx="recipeFormScreen:ingredientSectionTitlePlaceholder"
                labelTx="recipeFormScreen:ingredientSectionTitleLabel"
                status="error"
                helper={errors.ingredientSections?.[sectionIndex]?.title?.message ?? ""}
                maxLength={255}
              />
            )}
          />
        </View>
        {canRemoveSection && (
          <View style={{ marginTop: spacing.lg }}>
            <PressableIcon icon="x" onPress={onRemoveSection} />
          </View>
        )}
      </View>
      <Divider size={spacing.sm} />
      {lineFields.map((item, index) => (
        <View key={item.id || String(index)}>
          {index > 0 && <Divider size={spacing.sm} />}
          <View style={themedDirectionItemContainer}>
            <Text text="-" style={themedDirectionIndex} />
            <Controller
              control={control}
              name={`ingredientSections.${sectionIndex}.ingredients.${index}.name`}
              render={({ field }) => (
                <TextField
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholderTx="recipeFormScreen:ingredientPlaceholder"
                  containerStyle={themedTextFieldContainer}
                  status="error"
                  helper={
                    errors.ingredientSections?.[sectionIndex]?.ingredients?.[index]?.name
                      ?.message ?? ""
                  }
                  maxLength={255}
                  RightAccessory={() => (
                    <PressableIcon icon="x" onPress={() => removeLine(index)} />
                  )}
                />
              )}
            />
          </View>
          {errors.ingredientSections?.[sectionIndex]?.ingredients?.[index]?.name?.message && (
            <Text
              text={errors.ingredientSections[sectionIndex].ingredients![index]!.name!.message!}
              style={[errorTextStyle, { marginLeft: spacing.xl }]}
            />
          )}
        </View>
      ))}
      <Divider size={spacing.md} />
      <Button
        tx="recipeFormScreen:addAnotherIngredient"
        onPress={() => appendLine({ name: "", optional: false })}
        style={themedButtonHeightOverride}
        disabled={totalIngredientSlots >= MAX_INGREDIENTS_TOTAL}
      />
    </View>
  )
}
