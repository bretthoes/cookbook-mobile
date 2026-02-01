import { RecipeFormInputs } from "@/components/Recipe/RecipeForm"
import * as yup from "yup"

export const recipeSchema = yup.object({
  title: yup
    .string()
    .required("Title is required")
    .min(1, "Title at least 1 characters")
    .max(255, "Title at most 255 characters"),
  summary: yup.string().nullable().max(2048, "Summary at most 2048 characters"),
  preparationTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(10080, "Cannot exceed 10080 minutes (1 week)"),
  cookingTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(10080, "Cannot exceed 10080 minutes (1 week)"),
  bakingTimeInMinutes: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(10080, "Cannot exceed 10080 minutes (1 week)"),
  servings: yup
    .number()
    .nullable()
    .transform((value) => (value === "" ? null : value))
    .typeError("Must be a number")
    .min(0, "Must be greater than 0")
    .max(10080, "Cannot exceed 10080 minutes (1 week)"),
  ingredients: yup
    .array()
    .of(
      yup.object({
        name: yup.string().max(255, "Ingredient name cannot exceed 255 characters"),
        optional: yup.bool().nullable().default(false),
      }),
    )
    .max(40, "Cannot have more than 40 ingredients"),
  directions: yup
    .array()
    .of(
      yup.object({
        text: yup.string().max(2048, "Direction text cannot exceed 2048 characters"),
        image: yup.string().nullable().default(null),
      }),
    )
    .max(40, "Cannot have more than 40 directions"),
  images: yup.array().of(yup.string().required()).max(6, "Cannot have more than 6 images"),
}) as yup.ObjectSchema<RecipeFormInputs>
