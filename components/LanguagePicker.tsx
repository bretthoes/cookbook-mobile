import { ListItem } from "@/components/ListItem"
import { FormCard } from "@/components/FormCard"
import {
  getActiveLanguageCode,
  SUPPORTED_LANGUAGES,
  type SupportedLanguageCode,
} from "@/i18n/language"

export interface LanguagePickerProps {
  selectedCode?: SupportedLanguageCode
  onSelect: (code: SupportedLanguageCode) => void
}

export function LanguagePicker({ selectedCode, onSelect }: LanguagePickerProps) {
  const active = selectedCode ?? getActiveLanguageCode()

  return (
    <FormCard>
      {SUPPORTED_LANGUAGES.map((language) => (
        <ListItem
          key={language.code}
          text={language.name}
          bottomSeparator
          topSeparator
          onPress={() => onSelect(language.code)}
          rightIcon={active === language.code ? "check" : undefined}
        />
      ))}
    </FormCard>
  )
}
