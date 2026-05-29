import { ListItem } from "@/components/ListItem"
import { UseCase } from "@/components/UseCase"
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
    <UseCase>
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
    </UseCase>
  )
}
