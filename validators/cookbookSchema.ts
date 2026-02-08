import * as yup from "yup"

export const cookbookSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(1, "Title cannot be empty")
    .max(255, "Title cannot be longer than 255 characters"),
  image: yup.string().nullable().defined().max(2048, "Image cannot be longer than 2048 characters"),
})
