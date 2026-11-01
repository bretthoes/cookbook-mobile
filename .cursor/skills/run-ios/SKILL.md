---
name: run-ios
description: >-
  Launch and debug the cookbook-mobile iOS Simulator with the Expo dev client.
  Use when the user asks to run, open, or debug the iOS Simulator, iPhone
  simulator, npm run ios, Metro, or the dev client on iOS.
---

# Run iOS Simulator

Expo app **Love to Cook** (`com.cookbookmobile`, scheme `cookbookmobile`). This is an Expo **dev client**, not Expo Go. `/ios` is gitignored; `npm run ios` generates it.

From the cookbook-mobile repo root. **Permissions: `all`** — Simulator, `xcodebuild`, and `dotnet` fail in the sandbox. Do not install Xcode, simulators, or Expo Go. Do not target a physical device.

## 1. Status

```bash
bash .cursor/skills/run-ios/scripts/status.sh
```

A stopped simulator is normal. `npm run ios` boots one.

## 2. Dev API

On a Mac, Metro sets `EXPO_PUBLIC_DEV_API_PORT=5055` (`metro.config.js`) because AirPlay owns port 5000. The simulator calls `http://127.0.0.1:5055/api`. `Program.cs` in SharedCookbook binds `http://localhost:5055` on macOS.

If status says `api_5055: listening`, leave that process running.

If it says `not_listening`, start the API before you treat the simulator run as done. Run this in the background (`block_until_ms: 0`) from the sibling repo. It can run in parallel with the simulator launch. The first start often takes one to two minutes.

```bash
dotnet watch run
```

Working directory: `../SharedCookbook/src/Web` (next to cookbook-mobile). Watch for `Now listening on: http://localhost:5055` or a build/database error. Confirm with `curl -sf http://127.0.0.1:5055/health`. Do not start a second `dotnet watch` when 5055 is already listening.

## 3. Launch

`npm run ios` starts Metro and stays attached. Run it in the background (`block_until_ms: 0`) and watch for `Opening on` or a build error. The first native build often takes several minutes before that line.

Metro already listening on 8081 — do not start a second bundler:

```bash
npm run ios -- --no-bundler
```

That command exits after install. Wait up to 10 minutes (`block_until_ms: 600000`).

Native dependency change, or a failed pods / `ios/` / compile step — rebuild without the native cache:

```bash
npm run ios:reinstall
```

`ios:reinstall` is `expo run:ios --no-build-cache`. If Metro is already up, add the bundler flag: `npm run ios:reinstall -- --no-bundler`.

Pass any other Expo CLI flags after `--`.

## When launch fails

| Status / symptom | Action |
| --- | --- |
| `metro_8081: listening`, or "port 8081" in the Expo error | Rerun with `--no-bundler`. Leave the existing Metro process running. |
| Launch failed because no simulator was booted | Boot one, then retry. See below. |
| Pods, missing `ios/`, or a native compile error | `npm run ios:reinstall`. A missing `ios/` folder is also created by a normal `npm run ios`. |
| App opened, then crashed | Read the Metro terminal. Then capture a short device log (below). |
| `api_5055: not_listening` | Start the API (step 2). If `dotnet watch` fails, report that error. |

Boot a simulator only after a launch failed for lack of a device. Prefer an available iPhone:

```bash
xcrun simctl list devices available
xcrun simctl boot "<iPhone name>"
open -a Simulator
```

Use the first available iPhone when the user did not name one.

Native crash log (exits after 15 seconds):

```bash
xcrun simctl spawn booted log stream --timeout 15 --level error --style compact --predicate 'eventMessage CONTAINS[c] "cookbookmobile" OR processImagePath CONTAINS[c] "Love to Cook"'
```

Report the first crash line. `xcrun` is not hook-allowed; it still needs `all`.

## Reply

```
iOS simulator: <device or "launch failed">
Metro: <started | already on 8081>
API 5055: <listening | not listening>
```

On failure, add the Expo error line and the single fix you tried or still need.

## Auto-approval

`.cursor/hooks.json` allows `run-ios/scripts/status.sh`, `npm run ios`, `npm run ios:reinstall`, and `dotnet watch run`. `xcrun` and `open -a Simulator` stay on the normal approval path.

## What this skill does not do

- Install Xcode, simulator runtimes, or CocoaPods
- Physical devices
- Store builds (use the apple-upload skill)
