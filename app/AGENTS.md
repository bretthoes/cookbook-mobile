# app/ — agent notes

Expo Router file-based routes. Each `*.tsx` file under `app/` is a screen; folder names map to URL segments.

## Route tree

| Path                                                                                            | URL (examples)                                       | Notes                                                                                   |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `_layout.tsx`                                                                                   | —                                                    | Root: fonts, i18n, MST rehydration, `ThemeProvider`, renders `<Slot />`                 |
| `index.tsx`                                                                                     | `/`                                                  | Welcome; redirects authenticated users to tabs                                          |
| `login-options.tsx`, `log-in.tsx`, `register*.tsx`, `forgot-password.tsx`, `reset-password.tsx` | `/login-options`, …                                  | Unauthenticated auth flows                                                              |
| `i/[token].tsx`                                                                                 | `/i/:token`                                          | Deep link: accept cookbook invitation by token                                          |
| `(logged-in)/_layout.tsx`                                                                       | —                                                    | Auth guard: `<Redirect href="/login-options" />` if not authenticated; else `<Stack />` |
| `(logged-in)/index.tsx`                                                                         | `/(logged-in)`                                       | Redirects to `/(logged-in)/(tabs)/cookbooks`                                            |
| `(logged-in)/(tabs)/`                                                                           | `/(logged-in)/(tabs)/cookbooks`, `create`, `profile` | Tab navigator; custom `TabBar`                                                          |
| `(logged-in)/cookbook/`                                                                         | `…/cookbook/:id`, `…/cookbook/add`                   | Cookbook detail, edit, create                                                           |
| `(logged-in)/recipe/`                                                                           | `…/recipe/:id`, `…/recipe/add`, `add-options`, …     | Recipe CRUD and import flows                                                            |
| `(logged-in)/membership/`                                                                       | `…/membership/list`, `…/membership/:id`              | Members list and detail                                                                 |
| `(logged-in)/invitation/`                                                                       | `…/invitation`, `add-email`, `add-link`              | Invite collaborators                                                                    |
| `(logged-in)/onboarding.tsx`, `set-display-name.tsx`, `language.tsx`, `select-cookbook.tsx`     | various                                              | Onboarding and settings                                                                 |

**Route groups** `(logged-in)` and `(tabs)` do **not** appear in the URL.

## Auth boundaries

- **Unauthenticated screens** live at `app/` root (welcome, login, register).
- **Authenticated screens** live under `app/(logged-in)/`. The layout at `(logged-in)/_layout.tsx` enforces auth via `authenticationStore.isAuthenticated`.
- After login/register, navigate with `router.replace("/(logged-in)/(tabs)/cookbooks")` (or onboarding when display name is missing).

## Navigation

Use `router` from `expo-router` (`push`, `replace`, `back`).

| Pattern               | When to use                                                                        |
| --------------------- | ---------------------------------------------------------------------------------- |
| `router.replace(...)` | After login, after creating a resource when the user should not return to the form |
| `router.push(...)`    | Drill-down (detail → edit, list → detail)                                          |
| `router.back()`       | Close a pushed screen                                                              |

**Absolute paths** (from app root) are clearest for cross-group navigation:

```tsx
router.replace("/(logged-in)/(tabs)/cookbooks")
router.push("/(logged-in)/recipe/add-options")
```

**Relative paths** work from nested screens (e.g. from `cookbook/[id]/index.tsx`):

```tsx
router.push(`../../recipe/${recipeId}`)
router.replace("../../(tabs)/cookbooks")
```

Prefer absolute paths when unsure; relative paths depend on the current file's depth.

## Screen conventions

Every screen should:

1. Wrap content in `<Screen preset="scroll">` (or `fixed` / `auto`) from `@/components/Screen`.
2. Call `useHeader({ titleTx, leftIcon, onLeftPress, … })` from `@/utils/useHeader` for the nav bar.
3. Use `*Tx` props for all user-visible strings — never plain `text` / `placeholder` / `label`. Add keys in `i18n/en.ts` and `___` placeholders in `fr.ts` / `ko.ts`. See workspace rule `i18n-translation-standard`.
4. Use `useAppTheme()` and `ThemedStyle` for styles — see `.cursor/rules/theming-styles.mdc`.
5. Wrap with `observer()` from `mobx-react-lite` when reading MobX stores via `useStores()`.

Full examples: `.cursor/rules/screen-structure.mdc`.

## Adding a new screen

1. Create `app/(logged-in)/<feature>/<name>.tsx` (or at `app/` root if unauthenticated).
2. Default-export a component wrapped in `observer()` if it uses stores.
3. Add i18n keys under a section named for the screen (e.g. `recipeAddScreen`).
4. Navigate to it with `router.push("/(logged-in)/<feature>/<name>")`.
5. Set header via `useHeader`; do not use Expo's built-in stack headers (`headerShown: false` on layouts).

## Related docs

| Topic                | Location                                  |
| -------------------- | ----------------------------------------- |
| MobX stores          | `models/AGENTS.md`                        |
| API calls            | `services/api/README.md`                  |
| Reusable UI          | `.cursor/skills/add-component/SKILL.md`   |
| API contract changes | `.cursor/skills/sync-api-client/SKILL.md` |
