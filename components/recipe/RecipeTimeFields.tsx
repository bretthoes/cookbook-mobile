import { Divider } from "@/components/Divider"
import { TextField } from "@/components/TextField"
import type { RecipeFormInputs } from "@/components/recipe/RecipeForm"
import { spacing } from "@/theme"
import { Controller, type Control, type FieldErrors } from "react-hook-form"

function parseNullableInteger(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const FIELDS = [
  { name: "preparationTimeInMinutes", labelTx: "recipeFormScreen:prepLabel" },
  { name: "cookingTimeInMinutes", labelTx: "recipeFormScreen:cookLabel" },
  { name: "bakingTimeInMinutes", labelTx: "recipeFormScreen:bakeLabel" },
  { name: "servings", labelTx: "recipeFormScreen:servingsLabel" },
] as const

type RecipeTimeFieldsProps = {
  control: Control<RecipeFormInputs>
  errors: FieldErrors<RecipeFormInputs>
}

export function RecipeTimeFields({ control, errors }: RecipeTimeFieldsProps) {
  return (
    <>
      {FIELDS.map((field, index) => (
        <Controller
          key={field.name}
          name={field.name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              {index > 0 ? <Divider size={spacing.lg} /> : null}
              <TextField
                value={value != null ? String(value) : ""}
                onChangeText={(text) => onChange(parseNullableInteger(text))}
                helper={errors[field.name]?.message ?? ""}
                placeholderTx="recipeFormScreen:zeroPlaceholder"
                status="error"
                labelTx={field.labelTx}
                inputMode="numeric"
                keyboardType="numeric"
              />
            </>
          )}
        />
      ))}
    </>
  )
}
