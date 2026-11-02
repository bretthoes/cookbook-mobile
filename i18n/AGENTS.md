# i18n/ — agent notes

Locales are English (`en.ts`, source of `TxKeyPath`), French (`fr.ts`), and Korean (`ko.ts`). `initI18n` in `i18n.ts` runs from the root layout. The device locale is used until the user picks a language. That choice is AsyncStorage key `language` in `language.ts`.

## Keys

- camelCase.
- One top-level section per screen or feature: `loginScreen`, `recipeDetailsScreen`, `common`, `errors`.
- Lookup form is `section:key` (`common:ok`). Nested objects use dots (`membershipScreen:tier.owner`).
- User-visible strings use `tx` / `*Tx` props, or `translate()` from `i18n/translate.ts` outside React.

`TxKeyPath` is derived from the `en.ts` object. A key missing from `en.ts` is a type error. A key missing from `fr.ts` or `ko.ts` falls back to English at runtime.

## Adding a string

1. Add the key under the matching section in `en.ts`.
2. Add the same key in `fr.ts` and `ko.ts` with a real translation.
3. Run `npm run check:i18n`.

`scripts/check-i18n-parity.test.ts` requires every top-level section from `en.ts` to exist in `fr.ts` and `ko.ts`. It fails if any string still starts with `"___`. The check does not compare nested keys, so add those in all three files anyway.

`utils/formatDate.ts` loads a matching date-fns locale when the language changes. A new language needs a locale file, an entry in `SUPPORTED_LANGUAGES`, a `resources` entry in `i18n.ts`, and a date-fns locale in `loadDateFnsLocale`.
