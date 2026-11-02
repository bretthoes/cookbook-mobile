# components/ — agent notes

Reusable views. Screens in `app/` compose these.

Conventions for a new component: `.cursor/skills/add-component/SKILL.md`. Themed styles: `.cursor/rules/theming-styles.mdc`.

## Layout

- One component per file. There is no barrel `index.ts`. Import `@/components/Button`.
- A subfolder is only for a tight family: `Recipe/`, `Toggle/`, `subscription/`, `activity/`, `cookbooks/`, `Membership/`, `ErrorBoundary/`.
- Styles stay in the component file, prefixed with `$`, typed as `ThemedStyle`.

## What screens use

| Component | Role |
| --- | --- |
| `Screen` | Page wrapper. `preset` is `scroll`, `fixed`, or `auto`. |
| `Header` | Nav bar. Screens set it with `useHeader` from `@/utils/useHeader`. |
| `Text`, `Button`, `TextField`, `ListItem`, `EmptyState`, `Card` | User-visible copy goes through `tx` / `*Tx`. |
| `Icon` | `icon` is a key of the map in `Icon.tsx`. Add the asset and the key together. |
| `LoadingScreen` | Blocking wait, including recipe import. |
| `ItemNotFound` | Missing cookbook or recipe. |

UI that only one screen uses stays in that screen until a second caller needs it.
