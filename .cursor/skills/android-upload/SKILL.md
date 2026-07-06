---
name: android-upload
description: >-
  One-command production Android deploy for cookbook-mobile: EAS build + Google
  Play submit. Use when the user asks to upload to Google Play, deploy Android,
  run eas build/submit for Android, or release an Android build.
---

# Android Upload (hands-off)

Expo app **Love to Cook** (`com.cookbookmobile`). **Run one command, report the result.** Do not split into preflight / build / submit steps.

## Agent rules (mandatory)

When the user wants a production Android deploy:

1. **One shell command only** — do not run preflight, `git pull`, or `eas` separately.
2. **Permissions: `all`** — required for EAS tarball upload (sandbox breaks `git config`).
3. **`block_until_ms`: 1_800_000** (30 min) — build + submit run inside the script.
4. **No questions** unless the deploy script exits non-zero.
5. **No TodoWrite, Task subagents, or extra file reads** before running deploy.
6. **Short reply** — paste the `=== Android Deploy Report ===` block from script output; add at most 2 lines of context on failure.

### Command

From `cookbook-mobile` repo root:

```bash
bash .cursor/skills/android-upload/scripts/deploy.sh
```

If the user said they just pushed and want that code included:

```bash
bash .cursor/skills/android-upload/scripts/deploy.sh --pull
```

Submit-only (skip build):

```bash
bash .cursor/skills/android-upload/scripts/deploy.sh --submit-id <BUILD_ID>
```

Build-only (no submit):

```bash
bash .cursor/skills/android-upload/scripts/deploy.sh --build-only
```

**Terminal without agent:** `npm run deploy:android:prod` (same script; pass flags after `--`).

### Reply template (success)

Copy the script’s report block verbatim. Do not add a long checklist unless the user asks.

### Reply template (failure)

```
Deploy failed at step: <step from report>
<one-line error from script output>
Fix: <single concrete fix>
```

## Project constants

| Item           | Value                                              |
| -------------- | -------------------------------------------------- |
| Package        | `com.cookbookmobile`                               |
| Play Console   | https://play.google.com/console                    |
| Build profile  | `production`                                       |
| Submit profile | `production` (track: `internal` in `eas.json`)     |
| Prod API       | `config/config.prod.ts` → must not contain `CHANGEME` |

Submit needs a Google Play service account on EAS (`eas credentials` → Android → production). Do not commit the JSON key.

## Auto-approval hook

`.cursor/hooks.json` auto-allows the deploy script and related `eas` / `npm run deploy:android:prod` commands.

## Troubleshooting (only if deploy fails)

| Symptom                         | Fix                                                          |
| ------------------------------- | ------------------------------------------------------------ |
| `CHANGEME` in prod config       | Set `API_URL` in `config/config.prod.ts`, redeploy           |
| Not logged in to EAS            | User runs `eas login` locally, then redeploy                 |
| Signing / credentials           | `eas credentials` → Android → production                       |
| Play API / service account      | Play Console → API access; upload key on EAS                 |
| Package name mismatch           | `app.json` `android.package` must match Play Console app     |

## What this skill does not do

- Create the Google Play app listing
- Fill store listing, screenshots, or Data safety form
- Git commit or push unless the user asks separately
