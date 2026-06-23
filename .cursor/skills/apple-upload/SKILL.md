---
name: apple-upload
description: >-
  One-command production iOS deploy for cookbook-mobile: EAS build + App Store
  Connect submit. Use when the user asks to upload to Apple, deploy to the App
  Store, submit to TestFlight, run eas build/submit, or release an iOS build.
---

# Apple Upload (hands-off)

Expo app **Love to Cook** (`com.cookbookmobile`). **Run one command, report the result.** Do not split into preflight / build / submit steps.

## Agent rules (mandatory)

When the user wants a production Apple deploy:

1. **One shell command only** — do not run preflight, `git pull`, or `eas` separately.
2. **Permissions: `all`** — required for EAS tarball upload (sandbox breaks `git config`).
3. **`block_until_ms`: 1_800_000** (30 min) — build + submit run inside the script.
4. **No questions** unless the deploy script exits non-zero.
5. **No TodoWrite, Task subagents, or extra file reads** before running deploy.
6. **Short reply** — paste the `=== Apple Deploy Report ===` block from script output; add at most 2 lines of context on failure.

### Command

From `cookbook-mobile` repo root:

```bash
bash .cursor/skills/apple-upload/scripts/deploy.sh
```

If the user said they just pushed and want that code included:

```bash
bash .cursor/skills/apple-upload/scripts/deploy.sh --pull
```

Submit-only (skip build):

```bash
bash .cursor/skills/apple-upload/scripts/deploy.sh --submit-id <BUILD_ID>
```

Build-only (no submit):

```bash
bash .cursor/skills/apple-upload/scripts/deploy.sh --build-only
```

**Terminal without agent:** `npm run deploy:ios:prod` (same script; pass flags after `--`).

### Reply template (success)

Copy the script’s report block verbatim. Do not add a long checklist unless the user asks.

### Reply template (failure)

```
Deploy failed at step: <step from report>
<one-line error from script output>
Fix: <single concrete fix>
```

## Project constants

| Item           | Value                                                            |
| -------------- | ---------------------------------------------------------------- |
| Bundle ID      | `com.cookbookmobile`                                             |
| ASC App ID     | `6771159239`                                                     |
| TestFlight     | https://appstoreconnect.apple.com/apps/6771159239/testflight/ios |
| Build profile  | `production`                                                     |
| Submit profile | `production`                                                     |
| Prod API       | `config/config.prod.ts` → must not contain `CHANGEME`            |

Submit is preconfigured: `ascAppId` in `eas.json`; ASC API key on EAS (`[Expo] EAS Submit`).

## Auto-approval hook

`.cursor/hooks.json` auto-allows the deploy script and related `eas` / `npm run deploy:ios:prod` commands so the user is not prompted for each step. The agent still requests **`all`** sandbox permissions on the single Shell call.

## Troubleshooting (only if deploy fails)

| Symptom                   | Fix                                                |
| ------------------------- | -------------------------------------------------- |
| `CHANGEME` in prod config | Set `API_URL` in `config/config.prod.ts`, redeploy |
| Not logged in to EAS      | User runs `eas login` locally, then redeploy       |
| Signing / credentials     | `eas credentials` → iOS → production               |
| Submit agreement errors   | App Store Connect → Agreements, Tax, and Banking   |
| Empty bundle ID in ASC    | Register `com.cookbookmobile` in Apple Developer   |

## What this skill does not do

- Create the App Store Connect app record
- Fill screenshots, descriptions, or privacy labels
- Git commit or push unless the user asks separately
