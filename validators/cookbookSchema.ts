import { translate } from "@/i18n"
import * as yup from "yup"

export const cookbookSchema = yup.object().shape({
  title: yup
    .string()
    .required(() => translate("validation:titleRequired"))
    .min(1, () => translate("validation:titleCannotBeEmpty"))
    .max(255, () => translate("validation:titleCookbookMaxLength")),
  image: yup
    .string()
    .nullable()
    .defined()
    .max(2048, () => translate("validation:imageMaxLength")),
})
