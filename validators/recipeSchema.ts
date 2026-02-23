import { RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import { translate } from "@/i18n"
import * as yup from "yup"

export const recipeSchema = yup.object({
  title: yup
    .string()
    .required(() => translate("validation:titleRequired"))
    .min(1, () => translate("validation:titleMinLength"))
    .max(255, () => translate("validation:titleMaxLength")),
  summary: yup
    .string()
    .nullable()
    .max(2048, () => translate("validation:summaryMaxLength")),
  preparationTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError(() => translate("validation:mustBeNumber"))
    .min(0, () => translate("validation:mustBeGreaterThanZero"))
    .max(10080, () => translate("validation:maxMinutesExceeded")),
  cookingTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError(() => translate("validation:mustBeNumber"))
    .min(0, () => translate("validation:mustBeGreaterThanZero"))
    .max(10080, () => translate("validation:maxMinutesExceeded")),
  bakingTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError(() => translate("validation:mustBeNumber"))
    .min(0, () => translate("validation:mustBeGreaterThanZero"))
    .max(10080, () => translate("validation:maxMinutesExceeded")),
  servings: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError(() => translate("validation:mustBeNumber"))
    .min(0, () => translate("validation:mustBeGreaterThanZero"))
    .max(10080, () => translate("validation:maxMinutesExceeded")),
  ingredients: yup
    .array()
    .of(
      yup.object({
        name: yup
          .string()
          .max(255, () => translate("validation:ingredientNameMaxLength")),
        optional: yup.bool().nullable().default(false),
      }),
    )
    .max(40, () => translate("validation:maxIngredients")),
  directions: yup
    .array()
    .of(
      yup.object({
        text: yup
          .string()
          .max(2048, () => translate("validation:directionTextMaxLength")),
        image: yup.string().nullable().default(null),
      }),
    )
    .max(40, () => translate("validation:maxDirections")),
  images: yup
    .array()
    .of(yup.string().required())
    .max(6, () => translate("validation:maxImages")),
}) as yup.ObjectSchema<RecipeFormInputs>
