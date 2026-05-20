---
name: apple-upload
description: >-
  Builds cookbook-mobile for iOS with EAS and submits to App Store Connect
  (TestFlight / App Store). Use when the user asks to upload to Apple, deploy to
  the App Store, submit to TestFlight, run eas build/submit, or release an iOS
  build.
---

# Apple Upload (cookbook-mobile → App Store Connect)

Expo app **Love to Cook** (`com.cookbookmobile`). Builds run on EAS; upload uses `eas submit`. Do **not** use the `development` or `preview` profiles for App Store releases.

## Project constants

| Item | Value |
|------|--------|
| Bundle ID | `com.cookbookmobile` |
| ASC App ID (`ascAppId`) | `6771159239` (in `eas.json` → `submit.production.ios`) |
| TestFlight | https://appstoreconnect.apple.com/apps/6771159239/testflight/ios |
| EAS project | `app.json` → `extra.eas.projectId` |
| Build profile | `production` (`eas.json`) |
| Submit profile | `production` |
| Marketing version | `app.json` → `expo.version` (bump for user-facing releases) |
| Build number | Auto-incremented by EAS (`production.autoIncrement`) |

Production API: `config/config.prod.ts` → `API_URL` (must not be `CHANGEME`).

**Submit is configured:** `ascAppId` is in `eas.json`; App Store Connect API key is on EAS (`[Expo] EAS Submit`). Non-interactive `eas submit` should work without prompts. If `ascAppId` is ever missing, add the numeric **Apple ID** from App Store Connect → App → App Information (not your Apple account email).

## Workflow

Copy this checklist and update as you go:

```
Apple upload progress:
- [ ] Step 1: Preflight
- [ ] Step 2: Production iOS build
- [ ] Step 3: Submit to App Store Connect
- [ ] Step 4: Report status and next steps in App Store Connect
```

### Step 1: Preflight

From repo root (`cookbook-mobile`):

```bash
./.cursor/skills/apple-upload/scripts/preflight.sh
```

If preflight fails, fix blockers before building. Common fixes:

- **Prod config**: Set real values in `config/config.prod.ts` (especially `API_URL`).
- **Apple Developer**: Bundle ID must exist at [developer.apple.com](https://developer.apple.com/account) → Identifiers → `com.cookbookmobile` (App Store Connect dropdown stays empty until this exists).
- **EAS login**: `eas whoami` — run `eas login` if needed.
- **Version bump**: Edit `app.json` `expo.version` only when shipping a new marketing version to users.

Do not commit secrets. `config.prod.ts` values are bundled in the app (not secret), but still avoid adding API keys there.

### Step 2: Production iOS build

```bash
eas build --platform ios --profile production --non-interactive
```

- Omit `--non-interactive` on first setup or when credentials need configuration; EAS will prompt for Apple account / signing.
- Monitor: `eas build:list --platform ios --limit 3` or [expo.dev](https://expo.dev) → project → Builds.
- On failure: read build logs on Expo; common issues are signing, expired certificates, or Apple membership not active.

**Do not** run `eas build` with `--profile development` or `--profile preview` for App Store upload.

### Step 3: Submit to App Store Connect

After build status is **finished**:

```bash
eas submit --platform ios --profile production --latest --non-interactive
```

Or submit a specific build:

```bash
eas submit --platform ios --profile production --id <BUILD_ID> --non-interactive
```

If `--non-interactive` fails for auth, rerun without it so the user can sign in, or configure an [ASC API key](https://expo.fyi/creating-asc-api-key) on EAS.

Check submit status: `eas submit:list --platform ios --limit 3`

### Step 4: Tell the user what happens next

After a successful submit, report:

1. Build ID and submit status from CLI output.
2. Processing in App Store Connect usually takes **5–30 minutes** (sometimes longer).
3. **TestFlight**: [TestFlight for this app](https://appstoreconnect.apple.com/apps/6771159239/testflight/ios) → add internal testers.
4. **App Store release**: App Store tab → select version → attach build → complete metadata → Submit for Review.
5. Remind about **Agreements, Tax, and Banking** in App Store Connect if submit fails with agreement errors.

## Release checklist (agent should verify or ask)

- [ ] `config/config.prod.ts` has production `API_URL` (Fly: `https://sharedcookbook-api.fly.dev/api` or current prod host).
- [ ] Universal links: `associatedDomains` / `applinks:sharedcookbook.com` — `apple-app-site-association` hosted on domain.
- [ ] Google Sign-In / Facebook: OAuth client IDs in `config/config.base.ts` match production apps.
- [ ] App Review: test account credentials in review notes if login is required.
- [ ] Privacy questionnaire in App Store Connect matches app data collection.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Empty bundle ID in App Store Connect | Register `com.cookbookmobile` in Apple Developer → Identifiers |
| `eas: command not found` | `pnpm add -g eas-cli` or `npm i -g eas-cli` |
| Signing / credentials errors | `eas credentials` → iOS → production |
| Build not in TestFlight | Wait for processing; check email from Apple for compliance issues |
| `CHANGEME` in prod config | Fix `config.prod.ts` and rebuild — do not submit |
| `Set ascAppId in the submit profile` | Add `submit.production.ios.ascAppId` in `eas.json` (already `6771159239`) |

## Commands reference

```bash
# Full release path (after preflight passes)
eas build --platform ios --profile production
eas submit --platform ios --profile production --latest

# Status
eas build:list --platform ios --limit 5
eas submit:list --platform ios --limit 5
```

## Permissions

`eas build` and `eas submit` need network access. Request `full_network` (or `all` if sandbox blocks EAS) when running via the agent shell.

## What this skill does not do

- Create the App Store Connect app record (user does once in browser).
- Fill screenshots, descriptions, or privacy labels (guide user in App Store Connect).
- Push git commits or open PRs unless the user asks separately.
