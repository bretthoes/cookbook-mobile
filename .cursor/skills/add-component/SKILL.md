---
name: add-component
description: Add new reusable components following cookbook-mobile conventions. Use when creating a new component, adding UI primitives, or extracting shared UI into components.
---

# Adding a New Component

Follow these conventions when adding components to `components/` in this repository.

## 1. When to Add a Component

- The pattern would be useful in 2+ places
- It encapsulates meaningful UI behavior (selection, validation, layout)
- It keeps screen files focused on flow and data, not presentation details

Check for existing components first. Prefer composing `Button`, `Text`, `ListItem`, `OptionListItem`, `EmptyState`, etc. before creating new ones.

## 2. File Structure

One component per file. **No barrel files (index.ts).** Import directly by path.

```
components/
  MyComponent.tsx
  OptionListItem.tsx      # Flat in components/
  Toggle/
    Switch.tsx            # Import: from "@/components/Toggle/Switch"
    Checkbox.tsx
```

- Place components directly in `components/` when standalone
- Use a subfolder only when components are tightly related (e.g. Toggle/Switch, Toggle/Checkbox)
- Import from the component path: `@/components/OptionListItem`, `@/components/Toggle/Switch`
- Never create `index.ts` or other barrel files

## 3. Style Colocation

All styles live in the same file as the component. **Never create separate style files** (`*Styles.ts`, `*styles.ts`, etc.).

- Put styles at the bottom; use `// #region Styles` to organize
- If consumers need layout styles (e.g. container, list wrapper), export those constants from the same file (see OptionListItem's `$container`, `$listContainer`)

Style constants:
- Prefix with `$` (e.g. `$container`, `$listItemStyle`)
- Use `ThemedStyle<ViewStyle>` or `ThemedStyle<TextStyle>` from `@/theme`
- Use `theme.colors`, `theme.spacing` inside style fns; avoid raw numbers

## 4. Theming

- Use `useAppTheme()` for `themed` and `theme`
- Memoize themed styles before passing to JSX: `useMemo(() => themed($container), [themed])`
- Prefer `@/theme` design tokens over hardcoded colors/spacing

## 5. i18n (User-Facing Text)

All user-visible strings use translation. Never use `text`, `placeholder`, `label` for content shown to users.

- Prefer `*Tx` props: `tx`, `placeholderTx`, `labelTx`, `headingTx`, etc.
- Add keys in `i18n/en.ts` (camelCase, per screen/feature section)
- Add placeholders in other locales (`fr.ts`, `ko.ts`) with `___English string`

When defining a new component that accepts text:
- Offer `tx` and/or `*Tx` props alongside optional plain `text` / `*` for flexibility
- Document that consumers should prefer `*Tx` over plain string props

## 6. Imports and Exports

- Import from `@/components/...`, `@/theme`, `@/theme/context`, `@/i18n` as appropriate
- Export props types: `export interface MyComponentProps { ... }`
- Use `export function MyComponent` for the component

## 7. Example (Single-File Component)

```tsx
import type { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/theme/context"
import { useMemo } from "react"
import { View, ViewStyle } from "react-native"
import { Text } from "@/components/Text"

export interface MyComponentProps {
  tx?: string
  text?: string
}

export function MyComponent({ tx, text }: MyComponentProps) {
  const { themed } = useAppTheme()
  const $themedContainer = useMemo(() => themed($container), [themed])

  return (
    <View style={$themedContainer}>
      <Text tx={tx} text={text} />
    </View>
  )
}

// #region Styles
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  padding: theme.spacing.md,
})
// #endregion
```

## 8. Related Rules

- **reusable-components**: Prefer existing components; extract when pattern repeats
- **style-colocation**: No separate style files; colocate in component file
- **theming-styles**: useAppTheme, ThemedStyle, $ prefix, memoization
- **i18n-translation-standard**: *Tx props for all user-facing text
