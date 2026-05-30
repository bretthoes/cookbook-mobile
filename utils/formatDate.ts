// Note the syntax of these imports from the date-fns library.
// If you import with the syntax: import { format } from "date-fns" the ENTIRE library
// will be included in your production bundle (even if you only use one function).
// This is because react-native does not support tree-shaking.
import { type Locale } from "date-fns/locale"
import { format } from "date-fns/format"
import { parseISO } from "date-fns/parseISO"
import i18n from "i18next"

type Options = Parameters<typeof format>[2]

let dateFnsLocale: Locale

/** Loads the date-fns locale matching the active i18n language (en, fr, ko). */
export async function loadDateFnsLocale(): Promise<void> {
  const primaryTag = i18n.language.split("-")[0]
  switch (primaryTag) {
    case "fr":
      dateFnsLocale = (await import("date-fns/locale/fr")).fr
      break
    case "ko":
      dateFnsLocale = (await import("date-fns/locale/ko")).ko
      break
    case "en":
    default:
      dateFnsLocale = (await import("date-fns/locale/en-US")).enUS
      break
  }
}

export const formatDate = (date: string, dateFormat?: string, options?: Options) => {
  const dateOptions = {
    ...options,
    locale: dateFnsLocale,
  }
  return format(parseISO(date), dateFormat ?? "MMM dd, yyyy", dateOptions)
}
