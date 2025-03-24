import * as yup from "yup"

export const recipeSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title at least 3 characters")
    .max(255, "Title at most 255 characters"),
  summary: yup
    .string()
    .nullable()
    .defined()
    .min(3, "Summary at least 3 characters")
    .max(2048, "Summary at most 2048 characters"),
  preparationTimeInMinutes: yup
    .number()
    .nullable()
    .defined()
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 1k"),
  cookingTimeInMinutes: yup
    .number()
    .nullable()
    .defined()
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 1k"),
  bakingTimeInMinutes: yup
    .number()
    .nullable()
    .defined()
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 1k"),
  servings: yup
    .number()
    .nullable()
    .defined()
    .min(0, "Must be greater than 0")
    .max(999, "Cannot exceed 1k"),
  ingredients: yup
    .array()
    .required()
    .of(
      yup.object({
        name: yup
          .string()
          .required("Ingredient is required")
          .min(3, "Ingredient at least 3 characters")
          .max(255, "Ingredient at most 255 characters"),
        optional: yup.bool().nullable().defined().default(false),
      }),
    )
    .min(1, "At least one ingredient is required"),
  directions: yup
    .array()
    .required()
    .of(
      yup.object({
        text: yup
          .string()
          .required("Direction is required")
          .min(3, "Direction at least 3 characters")
          .max(2048, "Direction at most 2048 characters"),
        image: yup.string().nullable().defined().default(null),
      }),
    )
    .min(1, "At least one direction is required"),
  images: yup.array().required().of(yup.string().required()),
})
