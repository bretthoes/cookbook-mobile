import * as yup from "yup"
import { RecipeFormInputs } from "src/components/Recipe/RecipeForm"

export const recipeSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(1, "Title at least 1 characters")
    .max(255, "Title at most 255 characters"),
  summary: yup
    .string()
    .nullable()
    .max(2048, "Summary at most 2048 characters"),
  preparationTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 1k"),
  cookingTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 999 minutes"),
  bakingTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 999 minutes"),
  servings: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 999 minutes"),
  ingredients: yup
    .array()
    .required()
    .of(
      yup.object({
        name: yup
          .string()
          .required("Ingredient name is required")
          .min(1, "Ingredient name must be at least 1 character")
          .max(255, "Ingredient name cannot exceed 255 characters"),
        optional: yup.bool().nullable().default(false),
      }),
    )
    .min(1, "At least one ingredient is required")
    .max(40, "Cannot have more than 40 ingredients"),
  directions: yup
    .array()
    .required()
    .of(
      yup.object({
        text: yup
          .string()
          .required("Direction text is required")
          .min(1, "Direction text must be at least 1 character")
          .max(2048, "Direction text cannot exceed 2048 characters"),
        image: yup.string().nullable().default(null),
      }),
    )
    .min(1, "At least one direction is required")
    .max(20, "Cannot have more than 20 directions"),
  images: yup.array().required().of(yup.string().required()),
}) as yup.ObjectSchema<RecipeFormInputs>
