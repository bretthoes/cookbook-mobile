---
name: run-android
description: >-
  Launch and debug the cookbook-mobile Android emulator with the Expo dev
  client. Use when the user asks to run, open, or debug the Android emulator,
  AVD, npm run android, Metro, or the dev client on Android.
---

# Run Android emulator

Expo app **Love to Cook** (`com.cookbookmobile`, scheme `cookbookmobile`). This is an Expo **dev client**, not Expo Go. `/android` is gitignored; `npm run android` generates it.

From the cookbook-mobile repo root. **Permissions: `all`** — `adb`, `emulator`, Gradle, and `dotnet` fail in the sandbox. Do not install Android Studio, SDK packages, or Expo Go. Do not target a physical device.

## 1. Status

```bash
bash .cursor/skills/run-android/scripts/status.sh
```

## 2. Dev API

On a Mac, Metro sets `EXPO_PUBLIC_DEV_API_PORT=5055` (`metro.config.js`) because AirPlay owns port 5000. The emulator calls `http://10.0.2.2:5055/api` (`10.0.2.2` is the host loopback). Do not `adb reverse` that port. `Program.cs` in SharedCookbook binds `http://localhost:5055` on macOS.

If status says `api_5055: listening`, leave that process running.

If it says `not_listening`, start the API before you treat the emulator run as done. Run this in the background (`block_until_ms: 0`) from the sibling repo. It can run in parallel with the emulator boot. The first start often takes one to two minutes.

```bash
dotnet watch run
```

Working directory: `../SharedCookbook/src/Web` (next to cookbook-mobile). Watch for `Now listening on: http://localhost:5055` or a build/database error. Confirm with `curl -sf http://127.0.0.1:5055/health`. Do not start a second `dotnet watch` when 5055 is already listening.

## 3. Boot an emulator when none is connected

Skip this when `connected_devices` lists an emulator. If none are connected, start one AVD in the background (`block_until_ms: 0`). Use the name the user gave, otherwise the first name under `avds:`.

```bash
"<emulator path from status>" -avd "<avd name>"
```

Wait until boot finishes, then continue. Poll with `all` permissions:

```bash
"<adb path from status>" wait-for-device
"<adb path from status>" shell getprop sys.boot_completed
```

Proceed when that prints `1`. If `avds: none` or `emulator: not_found`, stop and report that. Do not create an AVD.

## 4. Launch

`npm run android` starts Metro and stays attached. Run it in the background (`block_until_ms: 0`) and watch for `Opening on` or a build error. The first native build often takes several minutes before that line.

Metro already listening on 8081 — do not start a second bundler:

```bash
npm run android -- --no-bundler
```

That command exits after install. Wait up to 10 minutes (`block_until_ms: 600000`).

Native dependency change, or a failed Gradle step — rebuild without the native cache:

```bash
npm run android -- --no-build-cache
```

If Metro is already up, pass both flags: `npm run android -- --no-build-cache --no-bundler`.

Pass any other Expo CLI flags after `--`.

## When launch fails

| Status / symptom | Action |
| --- | --- |
| `connected_devices: none` | Boot an AVD (step 3), then retry. |
| `metro_8081: listening`, or "port 8081" in the Expo error | Rerun with `--no-bundler`. Leave the existing Metro process running. |
| Gradle or a native compile error | `npm run android -- --no-build-cache`. A missing `android/` folder is created by a normal `npm run android`. |
| App opened, then crashed | Read the Metro terminal. Then capture logcat (below). |
| `api_5055: not_listening` | Start the API (step 2). If `dotnet watch` fails, report that error. |

Logcat for `com.cookbookmobile` (dump, then exit). Use the `adb` path from status:

```bash
pid="$(adb shell pidof -s com.cookbookmobile)"
adb logcat -d -t 200 --pid "${pid}"
```

If `pidof` prints nothing, the process already died. Dump the recent runtime errors instead:

```bash
adb logcat -d -t 200 AndroidRuntime:E ReactNativeJS:E ReactNative:E *:S
```

Report the first crash line. `adb` and `emulator` are not hook-allowed; they still need `all`.

## Reply

```
Android emulator: <device or avd, or "launch failed">
Metro: <started | already on 8081>
API 5055: <listening | not listening>
```

On failure, add the Expo or Gradle error line and the single fix you tried or still need.

## Auto-approval

`.cursor/hooks.json` allows `run-android/scripts/status.sh`, `npm run android`, and `dotnet watch run`. `adb` and `emulator` stay on the normal approval path.

## What this skill does not do

- Install Android Studio, system images, or create AVDs
- Physical devices
- Store builds (use the android-upload skill)
