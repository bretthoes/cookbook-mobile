import * as yup from "yup"

export const cookbookSchema = yup.object().shape({
  title: yup
    .string()
    .required("Title is required")
    .min(3, "Title at least 3 characters")
    .max(255, "Title at most 255 characters"),
  image: yup.string().nullable().defined(),
})
