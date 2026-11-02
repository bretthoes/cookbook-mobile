# theme/ — agent notes

Light and dark design tokens. `ThemeProvider` in `context.tsx` follows the system scheme unless the user overrides it (stored in MMKV). Read the active theme with `useAppTheme()` from `@/theme/context`.

## Tokens

| File | Role |
| --- | --- |
| `colors.ts`, `colorsDark.ts` | Semantic colors (`text`, `background`, `tint`, `error`, and the rest). Both files export the same keys. Add a color to both. |
| `spacing.ts`, `spacingDark.ts` | Scale from `xxxs` to `xxxl`. Dark currently matches light (`SPACING_MULTIPLIER` is 1). |
| `typography.ts`, `timing.ts` | Font families and animation durations. Shared by both themes. |
| `theme.ts`, `index.ts` | `lightTheme`, `darkTheme`, and `ThemedStyle<T>` (`(theme) => style`). |
| `styles.ts` | Shared snippets on `$styles`. |

Style a component with `ThemedStyle` and `themed()`:

```tsx
const $container: ThemedStyle<ViewStyle> = (theme) => ({
  backgroundColor: theme.colors.background,
  padding: theme.spacing.md,
})
```

Prefix style constants with `$` and keep them in the component file. Use tokens for color and spacing.

`context.utils.ts` exposes `setImperativeTheming` for code that cannot call the hook, such as the navigation theme. `largeFontEnabled` on the theme context is the persisted large-font preference.
